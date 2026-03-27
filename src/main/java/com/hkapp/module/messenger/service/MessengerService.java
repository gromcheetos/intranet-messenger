package com.hkapp.module.messenger.service;

import com.hkapp.module.messenger.dto.ChatMessageResponse;
import com.hkapp.module.messenger.vo.ChatMessageVO;
import com.hkapp.module.messenger.vo.ChatRoomMemberVO;
import com.hkapp.module.messenger.vo.ChatRoomVO;

import java.util.HashMap;
import java.util.List;
import java.util.Map;


public interface MessengerService {
    Map selectMessengerRoomsList(ChatRoomVO searchVO);
    int insertChatRoom(ChatRoomVO vo) throws Exception;
    List<ChatRoomMemberVO> selectChatRoomMemberList(ChatRoomMemberVO vo);
    HashMap<String, Object> selectUser(String userId);
    int insertChatRoomMember(ChatRoomMemberVO vo) throws Exception;
    int updateChatRoom(ChatRoomVO vo);
    List<Map> selectOnlineUsers();
    int insertMessage(ChatMessageVO vo) throws Exception;
    ChatMessageResponse saveSocketMessage(String roomId, String userId, String content) throws Exception;
    List<ChatMessageVO> selectMessageList(String roomId);

}
