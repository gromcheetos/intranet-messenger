package com.hkapp.module.security.controller;

import com.hkapp.module.common.exception.DuplicateFieldException;
import com.hkapp.module.security.service.CustomUserDetailsService;
import com.hkapp.module.security.service.SignUpService;
import com.hkapp.module.security.vo.UserVO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/hk/api")
@RequiredArgsConstructor
public class SignUpController {

    private final SignUpService signUpService;
    private final CustomUserDetailsService customUserDetailsService;

    @PostMapping("/auth/signup")
    public ResponseEntity<Map<String, Object>> signUp(@Valid @RequestBody UserVO vo, BindingResult bindingResult) {
        Map<String, Object> result = new HashMap<>();
        if (bindingResult.hasErrors()) {
            Map<String, Object> errors = new HashMap<>();
            bindingResult.getFieldErrors().forEach(err ->
                    errors.put(err.getField(), err.getDefaultMessage())
            );
            return ResponseEntity.badRequest().body(Map.of("errors", errors));
        }

        try {
            signUpService.signUp(vo);
        } catch (DuplicateFieldException e) {
            return ResponseEntity.badRequest().body(
                    Map.of("errors", Map.of(e.getField(), e.getMessage()))
            );
        }
        result.put("status", "SUCCESS");
        result.put("data", customUserDetailsService.loadUserByUsername(vo.getUserId()));
        return ResponseEntity.ok(result);
    }

    @GetMapping("/check-email")
    public ResponseEntity<Map<String, Boolean>> checkEmail(@RequestParam String email) {
        return ResponseEntity.ok(
                Map.of("taken", signUpService.isEmailTaken(email))
        );
    }
}