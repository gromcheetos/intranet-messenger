package com.hkapp.module.messenger.controller;

import com.hkapp.module.common.util.CommonUtil;
import com.hkapp.module.messenger.configuration.OnlineUserRegistry;
import com.hkapp.module.messenger.service.MessengerService;
import com.hkapp.module.messenger.vo.ChatMessageVO;
import com.hkapp.module.messenger.vo.ChatRoomMemberVO;
import com.hkapp.module.messenger.vo.ChatRoomVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.RequestEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@Slf4j
@RequiredArgsConstructor
@RequestMapping("/hk/api/messenger")
public class MessengerApiController {
    private final MessengerService messengerService;
    private final OnlineUserRegistry onlineUserRegistry;

    @GetMapping("/rooms")

    public ResponseEntity<Map> list(ChatRoomVO searchVO){
        Map result = new HashMap();

        result = messengerService.selectMessengerRoomsList(searchVO);
        //result.put("page", searchVO.getPageMap());
        result.put("status", "SUCCESS");

        return ResponseEntity.ok(result);
    }

    @GetMapping("/messages/{roomId}")
    public ResponseEntity<Map> messages(@PathVariable String roomId, ChatMessageVO searchVO){
        Map result = new HashMap();
        log.debug("roomId received" + roomId);
        searchVO.setRoomId(roomId);
        result.put("data", messengerService.selectMessageList(roomId));
        return ResponseEntity.ok(result);
    }

    @PostMapping("/newRoom")
    public ResponseEntity<Map> newRoom(@RequestBody ChatRoomVO vo) throws Exception {
        Map result = new HashMap();
        int cnt = messengerService.insertChatRoom(vo);
        if(cnt > 0) {
            result.put("roomId", vo.getRoomId());
            result.put("status", "SUCCESS");
        }
        return ResponseEntity.ok(result);
    }

    @PutMapping("/room/{roomId}")
    public ResponseEntity<Map> updateRoom(@PathVariable String roomId, @RequestBody ChatRoomVO vo) throws Exception {
        Map result = new HashMap();
        vo.setRoomId(roomId);
        int cnt = messengerService.updateChatRoom(vo);
        if(cnt > 0) {
            result.put("status", "SUCCESS");
            result.put("roomId", roomId);
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/user/current")
    public ResponseEntity<Map> currentMember(ChatRoomMemberVO vo){
        Map result = new HashMap();

        result.put("data", messengerService.selectUser(CommonUtil.getLoginId()));
        result.put("status", "SUCCESS");
        log.debug("result"+ result);
        return ResponseEntity.ok(result);
    }

    /*@GetMapping("/users/online") //Done
    public ResponseEntity<Map> onlineUsers(){
        Map result = new HashMap();
        List<Map> onlineUserList = messengerService.selectOnlineUsers();
        result.put("status", "SUCCESS");
        result.put("data", onlineUserList);
        log.debug("result" + result);
        return ResponseEntity.ok(result);
    }*/

    @GetMapping("/users/online")
    public ResponseEntity<Map<String, Object>> getOnlineUsers() {
        Map result = new HashMap();
        result.put("status", "SUCCESS");
        result.put("data", onlineUserRegistry.getOnlineUserIds());
        result.put("count", onlineUserRegistry.getOnlineCount());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/room/members/{roomId}") // Done
    public ResponseEntity<Map> membersList(@PathVariable String roomId, ChatRoomMemberVO vo) {
        vo.setRoomId(roomId);
        Map result = new HashMap();
        result.put("data", messengerService.selectChatRoomMemberList(vo));
        result.put("status", "SUCCESS");
        log.debug("result" + result);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/room/members/invite/{roomId}") //Done

    public ResponseEntity<HashMap> inviteMember(@RequestBody String userNm, @PathVariable String roomId) throws Exception {
        HashMap result = new HashMap();
        ChatRoomMemberVO vo = new ChatRoomMemberVO();
        log.debug("넘어온 사용자 정보" + userNm, roomId);
        HashMap<String, Object> userInfo = messengerService.selectUser(userNm);
        log.debug("조회한 사용자 정보" + userInfo);
        vo.setUserId(userInfo.get("userId").toString());
        vo.setRoomId(roomId);
        vo.setMemberRole("MEMBER");
        vo.setMemberNm(userInfo.get("userNm").toString());
        messengerService.insertChatRoomMember(vo);
        result.put("data", messengerService.selectUser(userInfo.get("userId").toString()));
        result.put("status", "SUCCESS");
        return ResponseEntity.ok(result);
    }

    @PostMapping("/send/message")
    public ResponseEntity<Map> sendMessage(RequestEntity<ChatMessageVO> vo) throws Exception {
        HashMap result = new HashMap();
        ChatMessageVO chatMessageVO = vo.getBody();
        int resultCnt = messengerService.insertMessage(chatMessageVO);
        if(resultCnt > 0) {
            result.put("status", "SUCCESS");
        }
        return ResponseEntity.ok(result);
    }

}
