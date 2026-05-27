package com.backend.service;

import com.backend.dto.request.RestroomCreateRequestDTO;
import com.backend.dto.request.RestroomUpdateRequestDTO;
import com.backend.dto.response.RestroomResponseDTO;
import com.backend.entity.Building;
import com.backend.entity.Category;
import com.backend.entity.Restroom;
import com.backend.entity.User;
import com.backend.repository.BuildingRepository;
import com.backend.repository.CategoryRepository;
import com.backend.repository.RestroomRepository;
import com.backend.repository.UserRepository;
import com.backend.util.AesUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class RestroomService {

    private final RestroomRepository restroomRepository;
    private final BuildingRepository buildingRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final AesUtil aesUtil;

    /**
     * 화장실 신규 등록
     */
    @Transactional
    public RestroomResponseDTO createRestroom(RestroomCreateRequestDTO request, Long userId) {
        log.info("화장실 등록 시작 - userId: {}, buildingName: {}", userId, request.getBuilding().getName());

        // 1. 사용자 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        // 2. 건물 조회 또는 신규 생성
        RestroomCreateRequestDTO.BuildingDTO bDto = request.getBuilding();
        Building building = buildingRepository.findByKakaoPlaceId(bDto.getKakaoPlaceId())
                .orElseGet(() -> {
                    log.info("새로운 건물 등록 - placeId: {}, name: {}", bDto.getKakaoPlaceId(), bDto.getName());
                    Building newBuilding = Building.builder()
                            .kakaoPlaceId(bDto.getKakaoPlaceId())
                            .name(bDto.getName())
                            .address(bDto.getAddress())
                            .roadAddress(bDto.getRoadAddress())
                            .latitude(bDto.getLatitude())
                            .longitude(bDto.getLongitude())
                            .phone(bDto.getPhone())
                            .category(bDto.getCategory())
                            .build();
                    return buildingRepository.save(newBuilding);
                });

        // 3. 카테고리 조회
        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElse(null);
        }

        // 4. 비밀번호 암호화
        String encryptedPassword = aesUtil.encrypt(request.getPassword());

        // 5. 화장실 엔티티 생성 및 저장
        Restroom restroom = Restroom.builder()
                .building(building)
                .user(user)
                .category(category)
                .floor(request.getFloor())
                .passwordEncrypted(encryptedPassword)
                .memo(request.getMemo())
                .isFavorite(false)
                .build();

        Restroom savedRestroom = restroomRepository.save(restroom);
        log.info("화장실 등록 완료 - restroomId: {}", savedRestroom.getId());

        return RestroomResponseDTO.from(savedRestroom, request.getPassword(), userId);
    }

    /**
     * 위경도 범위 내 화장실 목록 조회
     */
    public List<RestroomResponseDTO> getRestroomsInBounds(
            BigDecimal southWestLat, BigDecimal northEastLat,
            BigDecimal southWestLng, BigDecimal northEastLng,
            Long currentUserId) {

        log.info("범위 내 화장실 조회 - Lat: [{} ~ {}], Lng: [{} ~ {}]", southWestLat, northEastLat, southWestLng, northEastLng);

        // 1. 범위 내의 모든 건물 조회
        List<Building> buildings = buildingRepository.findByLatitudeBetweenAndLongitudeBetween(
                southWestLat, northEastLat, southWestLng, northEastLng
        );

        if (buildings.isEmpty()) {
            return new ArrayList<>();
        }

        // 2. 해당 건물들에 속하는 화장실들을 Fetch Join으로 효율적으로 긁어옴
        List<Restroom> restrooms = restroomRepository.findByBuildingInWithFetchJoin(buildings);

        // 3. 비밀번호 복호화 처리 후 DTO 매핑
        return restrooms.stream()
                .map(r -> {
                    String decryptedPassword = aesUtil.decrypt(r.getPasswordEncrypted());
                    return RestroomResponseDTO.from(r, decryptedPassword, currentUserId);
                })
                .collect(Collectors.toList());
    }

    /**
     * 화장실 정보 수정
     */
    @Transactional
    public RestroomResponseDTO updateRestroom(Long restroomId, RestroomUpdateRequestDTO request, Long userId) {
        log.info("화장실 정보 수정 요청 - restroomId: {}, userId: {}", restroomId, userId);

        Restroom restroom = restroomRepository.findById(restroomId)
                .orElseThrow(() -> new RuntimeException("Restroom not found: " + restroomId));

        // 작성자 검증
        if (!restroom.getUser().getId().equals(userId)) {
            throw new RuntimeException("You do not have permission to modify this restroom.");
        }

        // 카테고리 갱신
        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId()).orElse(null);
        }

        // 비밀번호 암호화 및 갱신 준비
        String encryptedPassword = null;
        if (request.getPassword() != null) {
            encryptedPassword = aesUtil.encrypt(request.getPassword());
        }

        restroom.updateInfo(request.getFloor(), encryptedPassword, request.getMemo(), category);
        log.info("화장실 정보 수정 완료 - restroomId: {}", restroom.getId());

        String decryptedPassword = aesUtil.decrypt(restroom.getPasswordEncrypted());
        return RestroomResponseDTO.from(restroom, decryptedPassword, userId);
    }

    /**
     * 화장실 정보 삭제
     */
    @Transactional
    public void deleteRestroom(Long restroomId, Long userId) {
        log.info("화장실 삭제 요청 - restroomId: {}, userId: {}", restroomId, userId);

        Restroom restroom = restroomRepository.findById(restroomId)
                .orElseThrow(() -> new RuntimeException("Restroom not found: " + restroomId));

        // 작성자 검증
        if (!restroom.getUser().getId().equals(userId)) {
            throw new RuntimeException("You do not have permission to delete this restroom.");
        }

        restroomRepository.delete(restroom);
        log.info("화장실 삭제 완료 - restroomId: {}", restroomId);
    }

    /**
     * 즐겨찾기 토글
     */
    @Transactional
    public RestroomResponseDTO toggleFavorite(Long restroomId, Long userId) {
        log.info("즐겨찾기 토글 요청 - restroomId: {}, userId: {}", restroomId, userId);

        Restroom restroom = restroomRepository.findById(restroomId)
                .orElseThrow(() -> new RuntimeException("Restroom not found: " + restroomId));

        restroom.toggleFavorite();
        log.info("즐겨찾기 토글 완료 - restroomId: {}, isFavorite: {}", restroomId, restroom.getIsFavorite());

        String decryptedPassword = aesUtil.decrypt(restroom.getPasswordEncrypted());
        return RestroomResponseDTO.from(restroom, decryptedPassword, userId);
    }

    /**
     * 즐겨찾는 화장실 목록 조회
     */
    public List<RestroomResponseDTO> getMyFavorites(Long userId) {
        log.info("즐겨찾는 화장실 목록 조회 - userId: {}", userId);

        List<Restroom> restrooms = restroomRepository.findFavoritesByUserIdWithFetchJoin(userId);

        return restrooms.stream()
                .map(r -> {
                    String decryptedPassword = aesUtil.decrypt(r.getPasswordEncrypted());
                    return RestroomResponseDTO.from(r, decryptedPassword, userId);
                })
                .collect(Collectors.toList());
    }

    /**
     * 내가 직접 등록한 화장실 목록 조회
     */
    public List<RestroomResponseDTO> getMyRestrooms(Long userId) {
        log.info("내가 등록한 화장실 목록 조회 - userId: {}", userId);

        List<Restroom> restrooms = restroomRepository.findByUserIdWithFetchJoin(userId);

        return restrooms.stream()
                .map(r -> {
                    String decryptedPassword = aesUtil.decrypt(r.getPasswordEncrypted());
                    return RestroomResponseDTO.from(r, decryptedPassword, userId);
                })
                .collect(Collectors.toList());
    }
}
