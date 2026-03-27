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
public class ChatRoomMemberVO extends MessengerUserVO {

        private String userId;
        private String roomId;
        private String memberRole;
        private int lastReadMessageId;
        private Timestamp joinedAt;
        private Timestamp leftAt;
        private String muteYn;
        private String memberNm;
}
