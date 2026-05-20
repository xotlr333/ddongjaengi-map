package com.backend.controller;

import com.backend.dto.response.AuthResponseDTO;
import com.backend.service.KakaoAuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final KakaoAuthService kakaoAuthService;

    @PostMapping("/kakao")
    public ResponseEntity<?> kakaoLogin(@RequestParam String code) {
        try {
            log.info("카카오 로그인 요청 코드 수신: {}", code);
            String token = kakaoAuthService.login(code);
            log.info("JWT 토큰 발급 성공");
            return ResponseEntity.ok(new AuthResponseDTO(token));
        } catch (Exception e) {
            log.error("카카오 로그인 중 오류 발생: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("로그인 실패: " + e.getMessage());
        }
    }
}
