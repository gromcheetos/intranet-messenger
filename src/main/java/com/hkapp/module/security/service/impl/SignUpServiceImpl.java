package com.hkapp.module.security.service.impl;

import com.hkapp.module.common.exception.DuplicateFieldException;
import com.hkapp.module.messenger.service.SequenceIdService;
import com.hkapp.module.security.mapper.UserMapper;
import com.hkapp.module.security.service.SignUpService;
import com.hkapp.module.security.vo.UserVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class SignUpServiceImpl implements SignUpService {

    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final SequenceIdService sequenceIdService;  // your existing ID generator

    @Override
    @Transactional
    public void signUp(UserVO vo) {
        if (isEmailTaken(vo.getEmail())) {
            throw new DuplicateFieldException("email", "Email is already registered");
        }

        //String userId = sequenceIdService.nextId("USR");
        vo.setUserId(vo.getUserId());

        vo.setPwd(passwordEncoder.encode(vo.getPwd()));

        userMapper.insertUser(vo);

    }


    @Override
    public boolean isEmailTaken(String email) {
        return userMapper.countByEmail(email) > 0;
    }
}