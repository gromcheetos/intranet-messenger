package com.hkapp.module.messenger.dto;

import lombok.*;

@AllArgsConstructor
@ToString
@EqualsAndHashCode
@Getter
@Setter
@NoArgsConstructor
public class ChatMessageRequest {
        private String roomId;
        private String content;

}
