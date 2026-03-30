package com.hkapp.module.messenger.service.impl;

import com.hkapp.module.common.util.CommonUtil;
import com.hkapp.module.messenger.mapper.MessengerMapper;
import com.hkapp.module.messenger.dto.ChatMessageResponse;
import com.hkapp.module.messenger.service.MessengerService;
import com.hkapp.module.messenger.service.SequenceIdService;
import com.hkapp.module.messenger.vo.ChatMessageVO;
import com.hkapp.module.messenger.vo.ChatRoomMemberVO;
import com.hkapp.module.messenger.vo.ChatRoomVO;
import com.hkapp.module.security.mapper.UserMapper;
import com.hkapp.module.security.vo.UserVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class MessengerServiceImpl  implements MessengerService {
    private final MessengerMapper messengerDAO;
    private static final Set<String> onlineUsers = ConcurrentHashMap.newKeySet();

    private final UserMapper userMapper;
    private final SequenceIdService sequenceIdService;

    public Map selectMessengerRoomsList(ChatRoomVO vo){
        HashMap<String, Object> returnMap = new HashMap<>();
        vo.setLoginId(CommonUtil.getLoginId());

        returnMap.put("data", messengerDAO.selectMessengerRoomsList(vo));

        return returnMap;
    }

    @Override
    public int insertChatRoom(ChatRoomVO vo)  {
        int cnt = 0;
        String roomId = sequenceIdService.nextId("RNO");
        vo.setRoomId(roomId);
        vo.setLoginId(CommonUtil.getLoginId());
        ChatRoomMemberVO memberVO = new ChatRoomMemberVO();
        if(messengerDAO.insertChatRoom(vo) > 0) {
            HashMap<String, Object> userMap = messengerDAO.selectUser(vo.getLoginId());
            memberVO.setRoomId(roomId);
            memberVO.setMuteYn("N");
            memberVO.setMemberRole("OWNER");
            memberVO.setUserId(CommonUtil.getLoginId());
            memberVO.setMemberNm(userMap.get("userNm").toString());
            insertChatRoomMember(memberVO);
            cnt ++;
        }
        return cnt;
    }

    public int updateChatRoom(ChatRoomVO vo) {
        int cnt = 0;
        if(messengerDAO.updateChatRoom(vo) > 0){
            cnt ++;
        }
        return cnt;
    }

    public int insertChatRoomMember(ChatRoomMemberVO vo)  {
        int cnt = 0;
        if(messengerDAO.insertChatRoomMember(vo) > 0){
            cnt ++;
        }

        return cnt;
    }

    public List<ChatRoomMemberVO> selectChatRoomMemberList(ChatRoomMemberVO vo){

        return messengerDAO.selectChatRoomMemberList(vo);
    }

    public HashMap<String, Object> selectUser(String userNm){
        return messengerDAO.selectUser(userNm);
    }

    @Override
    public List<UserVO> getOnlineUsers(Set<String> userIds) {
        return userIds.stream()
                .map(userMapper::selectUserByUsername)
                .filter(Objects::nonNull)
                .toList();
    }

    public int insertMessage(ChatMessageVO vo) {
        int cnt = 0;
        String messageId = sequenceIdService.nextId("MSG");
        vo.setMessageId(messageId);
        vo.setUserId(CommonUtil.getLoginId());
        if(messengerDAO.insertMessage(vo) > 0){
            cnt ++;
        }
        return cnt;
    }

    @Override
    public ChatMessageResponse saveSocketMessage(String roomId, String userId, String content) throws Exception {
        ChatMessageVO vo = new ChatMessageVO();
        vo.setMessageId(sequenceIdService.nextId("MSG"));
        vo.setRoomId(roomId);
        vo.setUserId(userId);
        vo.setContent(content);
        messengerDAO.insertMessage(vo);
        return messengerDAO.selectLatestMessage(vo);
    }

    public List<ChatMessageVO> selectMessageList(String roomId){
        return messengerDAO.selectMessageList(roomId);
    }

    public int deleteChatRoom(ChatRoomMemberVO vo){
        int cnt = 0;
        ChatRoomMemberVO roomAuth = messengerDAO.selectChatMember(vo);
        if("OWNER".equals(roomAuth.getMemberRole())){
            ChatRoomVO roomVO = new ChatRoomVO();
            roomVO.setRoomId(vo.getRoomId());
            messengerDAO.deleteChatRoom(roomVO);
            cnt ++;
        }
        return cnt;
    }

    public int deleteMember(ChatRoomMemberVO vo){
        int cnt = 0;
        if(messengerDAO.deleteMember(vo) > 0){
            cnt ++;
        }
        return cnt;
    }
}
