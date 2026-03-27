package com.hkapp.module.security.service;

import com.hkapp.module.security.vo.UserVO;

import java.util.Map;

public interface SignUpService {
    void signUp(UserVO vo);

    boolean isEmailTaken(String email);
}
