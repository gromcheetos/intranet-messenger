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
public class ChatRoomVO extends MessengerUserVO{


    private String roomId;
    private String roomType;
    private String title;
    private String createdBy;
    private Timestamp createdAt;
    private String activeYn;

    private String langCd;
    private String langCl;
    //private String roomNm;
    private int startRow;
    private int endRow;
    private boolean isPaging = true;
    private Integer cnt;

}
