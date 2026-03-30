package com.hkapp.module.messenger.mapper;

import com.hkapp.module.messenger.dto.ChatMessageResponse;
import com.hkapp.module.messenger.vo.ChatMessageVO;
import com.hkapp.module.messenger.vo.ChatRoomMemberVO;
import com.hkapp.module.messenger.vo.ChatRoomVO;
import org.apache.ibatis.annotations.Mapper;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Mapper
public interface MessengerMapper {

    int selectMessengerRoomsListCnt(ChatRoomVO vo);

    List<ChatRoomVO> selectMessengerRoomsList(ChatRoomVO vo);

    int insertChatRoom(ChatRoomVO vo);

    int insertChatRoomMember(ChatRoomMemberVO vo);

    List<ChatRoomMemberVO> selectChatRoomMemberList(ChatRoomMemberVO vo);

    HashMap<String, Object> selectUser(String userNm);

    int updateChatRoom(ChatRoomVO vo);

    List<Map> selectOnlineUsers();

    int insertMessage(ChatMessageVO vo);

    ChatMessageResponse selectLatestMessage(ChatMessageVO vo);

    List<ChatMessageVO> selectMessageList(String roomId);
    ChatRoomMemberVO selectChatMember(ChatRoomMemberVO vo);
    int deleteChatRoom(ChatRoomVO vo);
    int deleteMember(ChatRoomMemberVO vo);
}
