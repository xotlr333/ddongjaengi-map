package com.backend.dto.response;

import com.backend.entity.Building;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BuildingResponseDTO {
    private Long id;
    private String kakaoPlaceId;
    private String name;
    private String address;
    private String roadAddress;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String phone;
    private String category;

    public static BuildingResponseDTO from(Building building) {
        if (building == null) return null;
        return BuildingResponseDTO.builder()
                .id(building.getId())
                .kakaoPlaceId(building.getKakaoPlaceId())
                .name(building.getName())
                .address(building.getAddress())
                .roadAddress(building.getRoadAddress())
                .latitude(building.getLatitude())
                .longitude(building.getLongitude())
                .phone(building.getPhone())
                .category(building.getCategory())
                .build();
    }
}
