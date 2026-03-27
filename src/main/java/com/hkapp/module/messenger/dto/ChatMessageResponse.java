package com.hkapp.module.messenger.dto;

import lombok.*;

import java.sql.Timestamp;

@AllArgsConstructor
@ToString
@EqualsAndHashCode
@Getter
@Setter
public class ChatMessageResponse {
    private String messageId;
    private String roomId;
    private String senderId;
    private String content;
    private Timestamp createdAt;

}
