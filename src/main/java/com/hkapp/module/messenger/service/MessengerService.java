package com.hkapp.module.messenger.service;

import com.hkapp.module.messenger.dto.ChatMessageResponse;
import com.hkapp.module.messenger.vo.ChatMessageVO;
import com.hkapp.module.messenger.vo.ChatRoomMemberVO;
import com.hkapp.module.messenger.vo.ChatRoomVO;
import com.hkapp.module.security.vo.UserVO;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;


public interface MessengerService {
    Map selectMessengerRoomsList(ChatRoomVO searchVO);
    int insertChatRoom(ChatRoomVO vo) throws Exception;
    List<ChatRoomMemberVO> selectChatRoomMemberList(ChatRoomMemberVO vo);
    HashMap<String, Object> selectUser(String userId);
    int insertChatRoomMember(ChatRoomMemberVO vo) throws Exception;
    int updateChatRoom(ChatRoomVO vo);
    List<UserVO> getOnlineUsers(Set<String> userIds);
    int insertMessage(ChatMessageVO vo) throws Exception;
    ChatMessageResponse saveSocketMessage(String roomId, String userId, String content) throws Exception;
    List<ChatMessageVO> selectMessageList(String roomId);
    int deleteChatRoom(ChatRoomMemberVO vo);
    int deleteMember(ChatRoomMemberVO vo);
}
