package com.hkapp.module.security.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/hk/api")
public class AuthController {

    @GetMapping("/auth/me")
    public ResponseEntity<Map<String, String>> getCurrentUser(
            @AuthenticationPrincipal UserDetails userDetails) {

        return ResponseEntity.ok(Map.of("username", userDetails.getUsername()));
    }

    @GetMapping("/auth/invalid-session")
    public ResponseEntity<Map<String, String>> invalidSession() {
        return ResponseEntity.status(401)
                .body(Map.of("error", "Session invalid"));
    }

    @GetMapping("/auth/session-expired")
    public ResponseEntity<Map<String, String>> sessionExpired() {
        return ResponseEntity.status(401)
                .body(Map.of("error", "Session expired"));
    }
}