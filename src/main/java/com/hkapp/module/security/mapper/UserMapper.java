package com.hkapp.module.security.mapper;


import com.hkapp.module.security.vo.UserVO;
import org.apache.ibatis.annotations.Mapper;

import java.util.Map;

@Mapper
public interface UserMapper {

    UserVO selectUserByUsername(String userId);

    int countByEmail(String email);

    void insertUser(UserVO vo);
}