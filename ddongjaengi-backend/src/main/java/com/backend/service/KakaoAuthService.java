package com.backend.service;

import com.backend.entity.User;
import com.backend.repository.UserRepository;
import com.backend.security.JwtProvider;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.reactive.function.client.WebClient;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class KakaoAuthService {

    private final UserRepository userRepository;
    private final JwtProvider jwtProvider;
    private final WebClient webClient;

    @Value("${kakao.client-id}")
    private String clientId;

    @Value("${kakao.redirect-uri}")
    private String redirectUri;

    @Value("${kakao.client-secret:}")
    private String clientSecret;

    public KakaoAuthService(UserRepository userRepository, JwtProvider jwtProvider, WebClient.Builder webClientBuilder) {
        this.userRepository = userRepository;
        this.jwtProvider = jwtProvider;
        this.webClient = webClientBuilder.build();
    }

    @Transactional
    public String login(String code) {
        // 1. 카카오 Access Token 요청
        String kakaoAccessToken = getKakaoAccessToken(code);

        // 2. 카카오 유저 정보 요청
        JsonNode userInfo = getKakaoUserInfo(kakaoAccessToken);

        Long kakaoId = userInfo.get("id").asLong();
        JsonNode kakaoAccount = userInfo.get("kakao_account");
        String email = (kakaoAccount != null && kakaoAccount.has("email")) ? kakaoAccount.get("email").asText() : null;
        
        JsonNode properties = userInfo.get("properties");
        String nickname = (properties != null && properties.has("nickname")) ? properties.get("nickname").asText() : "사용자";
        String profileImageUrl = (properties != null && properties.has("profile_image")) ? properties.get("profile_image").asText() : null;

        // 3. 유저 저장 및 갱신
        User user = userRepository.findByKakaoId(kakaoId).orElseGet(() -> {
            User newUser = User.builder()
                    .kakaoId(kakaoId)
                    .email(email)
                    .nickname(nickname)
                    .profileImageUrl(profileImageUrl)
                    .isActive(true)
                    .build();
            return userRepository.save(newUser);
        });

        user.updateProfile(nickname, profileImageUrl);
        user.updateLastLogin();

        // 4. JWT 발급
        return jwtProvider.createToken(user.getId());
    }

    private String getKakaoAccessToken(String code) {
        log.info("카카오 Access Token 요청 시작 - code: {}, client_id: {}, redirect_uri: {}", code, clientId, redirectUri);
        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("grant_type", "authorization_code");
        body.add("client_id", clientId);
        body.add("redirect_uri", redirectUri);
        body.add("code", code);
        if (clientSecret != null && !clientSecret.isEmpty()) {
            body.add("client_secret", clientSecret);
        }

        try {
            JsonNode response = webClient.post()
                    .uri("https://kauth.kakao.com/oauth/token")
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(JsonNode.class)
                    .block();

            if (response != null && response.has("access_token")) {
                String accessToken = response.get("access_token").asText();
                log.info("카카오 Access Token 획득 성공");
                return accessToken;
            }
            log.error("카카오 토큰 응답에 access_token이 없음: {}", response);
            throw new RuntimeException("Failed to get Kakao access token: response did not contain access_token");
        } catch (org.springframework.web.reactive.function.client.WebClientResponseException e) {
            log.error("카카오 Access Token 요청 실패 - 상태 코드: {}, 응답 바디: {}", e.getStatusCode(), e.getResponseBodyAsString(), e);
            throw new RuntimeException("Kakao access token request failed: " + e.getResponseBodyAsString(), e);
        } catch (Exception e) {
            log.error("카카오 Access Token 요청 중 예외 발생: ", e);
            throw new RuntimeException("Kakao access token request failed: " + e.getMessage(), e);
        }
    }

    private JsonNode getKakaoUserInfo(String accessToken) {
        log.info("카카오 유저 정보 요청 시작");
        try {
            JsonNode response = webClient.get()
                    .uri("https://kapi.kakao.com/v2/user/me")
                    .header("Authorization", "Bearer " + accessToken)
                    .retrieve()
                    .bodyToMono(JsonNode.class)
                    .block();
            log.info("카카오 유저 정보 획득 성공");
            return response;
        } catch (Exception e) {
            log.error("카카오 유저 정보 요청 중 예외 발생: ", e);
            throw new RuntimeException("Kakao user info request failed: " + e.getMessage(), e);
        }
    }
}
