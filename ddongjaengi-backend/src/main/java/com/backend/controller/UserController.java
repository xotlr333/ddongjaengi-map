package com.backend.controller;

import com.backend.entity.User;
import com.backend.repository.UserRepository;
import com.backend.security.LoginUser;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Slf4j
public class UserController {

    private final UserRepository userRepository;

    @GetMapping("/me")
    public ResponseEntity<?> getMe(@LoginUser Long userId) {
        log.info("API: 로그인된 회원 정보 조회 - userId: {}", userId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        Map<String, Object> response = new HashMap<>();
        Map<String, Object> userData = new HashMap<>();
        userData.put("id", user.getId());
        userData.put("nickname", user.getNickname());
        userData.put("profileImageUrl", user.getProfileImageUrl());
        userData.put("email", user.getEmail());
        userData.put("isActive", user.getIsActive());
        
        response.put("data", userData);
        return ResponseEntity.ok(response);
    }
}
