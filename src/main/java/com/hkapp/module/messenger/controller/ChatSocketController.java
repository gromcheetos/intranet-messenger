package com.hkapp.module.messenger.controller;

import com.hkapp.module.common.vo.LoginInfo;
import com.hkapp.module.messenger.configuration.OnlineUserRegistry;
import com.hkapp.module.messenger.dto.ChatMessageRequest;
import com.hkapp.module.messenger.dto.ChatMessageResponse;
import com.hkapp.module.messenger.service.MessengerService;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Controller;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.security.Principal;
import java.util.Map;
import java.util.Set;

@Controller
@Slf4j
@AllArgsConstructor
public class ChatSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final OnlineUserRegistry onlineUserRegistry;
    private MessengerService messengerService;

    @MessageMapping("/chat.send")
    public void sendMessage(ChatMessageRequest request, SimpMessageHeaderAccessor headerAccessor) throws Exception {

        LoginInfo loginInfo = (LoginInfo) headerAccessor.getSessionAttributes().get("loginInfo");
        String userId = loginInfo.getLoginId();
        log.debug("userId=" + userId);
        ChatMessageResponse savedMessage =
                messengerService.saveSocketMessage(request.getRoomId(), userId, request.getContent());

        messagingTemplate.convertAndSend(
                "/topic/chat/room/" + request.getRoomId(),
                savedMessage
        );
    }

    @EventListener
    public void handleConnect(SessionConnectedEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        String userId = getUserId(accessor);
        if (userId == null) return;

        onlineUserRegistry.add(userId);
        broadcastOnlineUsers();
    }

    @EventListener
    public void handleDisconnect(SessionDisconnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        String userId = getUserId(accessor);
        if (userId == null) return;

        onlineUserRegistry.remove(userId);
        broadcastOnlineUsers();
    }

    private void broadcastOnlineUsers() {
        Set<String> onlineUsers = onlineUserRegistry.getOnlineUserIds();
        log.debug("Broadcasting online users: {}", onlineUsers);

        messagingTemplate.convertAndSend(
                "/topic/online-users",
                Map.of("onlineUsers", onlineUsers)
        );
    }

    private String getUserId(StompHeaderAccessor accessor) {
        Principal principal = accessor.getUser();
        if (principal == null) {
            log.warn("WebSocket event with no principal — session may not be authenticated");
            return null;
        }
        return principal.getName();  // returns userId (set in CustomUserDetailsService)
    }

}
