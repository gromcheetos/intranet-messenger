package com.hkapp.module.security.vo;

import lombok.Data;

import java.sql.Timestamp;

@Data
public class UserVO {
    private String userId;
    private String userNm;
    private String pwd;    // BCrypt-encoded
    private String useYn;
    private Timestamp regDt;
    private String email;
}
