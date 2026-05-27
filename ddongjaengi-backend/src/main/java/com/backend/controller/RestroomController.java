package com.backend.controller;

import com.backend.dto.request.RestroomCreateRequestDTO;
import com.backend.dto.request.RestroomUpdateRequestDTO;
import com.backend.dto.response.RestroomResponseDTO;
import com.backend.security.LoginUser;
import com.backend.service.RestroomService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/restrooms")
@RequiredArgsConstructor
@Slf4j
public class RestroomController {

    private final RestroomService restroomService;

    /**
     * 화장실 등록 API
     */
    @PostMapping
    public ResponseEntity<RestroomResponseDTO> create(
            @RequestBody RestroomCreateRequestDTO request,
            @LoginUser Long userId) {
        log.info("API: 화장실 등록 요청 - userId: {}", userId);
        RestroomResponseDTO response = restroomService.createRestroom(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * 지도 영역 기반 화장실 리스트 조회 API
     */
    @GetMapping("/search")
    public ResponseEntity<List<RestroomResponseDTO>> searchInBounds(
            @RequestParam BigDecimal southWestLat,
            @RequestParam BigDecimal southWestLng,
            @RequestParam BigDecimal northEastLat,
            @RequestParam BigDecimal northEastLng,
            @LoginUser Long userId) {
        log.info("API: 영역 범위 화장실 검색 - userId: {}", userId);
        List<RestroomResponseDTO> response = restroomService.getRestroomsInBounds(
                southWestLat, northEastLat, southWestLng, northEastLng, userId
        );
        return ResponseEntity.ok(response);
    }

    /**
     * 화장실 정보 수정 API
     */
    @PutMapping("/{id}")
    public ResponseEntity<RestroomResponseDTO> update(
            @PathVariable Long id,
            @RequestBody RestroomUpdateRequestDTO request,
            @LoginUser Long userId) {
        log.info("API: 화장실 정보 수정 - restroomId: {}, userId: {}", id, userId);
        RestroomResponseDTO response = restroomService.updateRestroom(id, request, userId);
        return ResponseEntity.ok(response);
    }

    /**
     * 화장실 정보 삭제 API
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @LoginUser Long userId) {
        log.info("API: 화장실 정보 삭제 - restroomId: {}, userId: {}", id, userId);
        restroomService.deleteRestroom(id, userId);
        return ResponseEntity.noContent().build();
    }

    /**
     * 즐겨찾기 토글 API
     */
    @PostMapping("/{id}/favorite")
    public ResponseEntity<RestroomResponseDTO> toggleFavorite(
            @PathVariable Long id,
            @LoginUser Long userId) {
        log.info("API: 즐겨찾기 토글 - restroomId: {}, userId: {}", id, userId);
        RestroomResponseDTO response = restroomService.toggleFavorite(id, userId);
        return ResponseEntity.ok(response);
    }

    /**
     * 내 즐겨찾기 화장실 리스트 조회 API
     */
    @GetMapping("/favorites")
    public ResponseEntity<List<RestroomResponseDTO>> getFavorites(
            @LoginUser Long userId) {
        log.info("API: 내 즐겨찾기 목록 조회 - userId: {}", userId);
        List<RestroomResponseDTO> response = restroomService.getMyFavorites(userId);
        return ResponseEntity.ok(response);
    }

    /**
     * 내가 직접 등록한 화장실 리스트 조회 API
     */
    @GetMapping("/my")
    public ResponseEntity<List<RestroomResponseDTO>> getMyRestrooms(
            @LoginUser Long userId) {
        log.info("API: 내가 등록한 화장실 목록 조회 - userId: {}", userId);
        List<RestroomResponseDTO> response = restroomService.getMyRestrooms(userId);
        return ResponseEntity.ok(response);
    }
}
