package com.hkapp.module.messenger.vo;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.sql.Timestamp;

@Getter
@Setter
@ToString
@EqualsAndHashCode
public class ChatMessageVO {

    private String messageId;
    private String roomId;
    private String senderId;
    private String content;
    private Timestamp createdAt;
    private String deletedYn;
    private String userId;
}
