package com.hkapp.module.common.vo;

import lombok.*;

import java.io.Serializable;

@Builder
@Getter
@Setter
public class LoginInfo implements Serializable {

    private String userNm;
    private String email;
    private String pwd;
    private String loginId;

}
