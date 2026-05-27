package com.backend.dto.response;

import com.backend.entity.Restroom;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RestroomResponseDTO {
    private Long id;
    private BuildingResponseDTO building;
    private String floor;
    private String password;
    private String memo;
    private Boolean isFavorite;
    private CategoryDTO category;
    private String creatorNickname;
    private Boolean isCreator;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CategoryDTO {
        private Long id;
        private String name;
        private String icon;
        private String color;
    }

    public static RestroomResponseDTO from(Restroom restroom, String decryptedPassword, Long currentUserId) {
        if (restroom == null) return null;

        CategoryDTO catDTO = null;
        if (restroom.getCategory() != null) {
            catDTO = CategoryDTO.builder()
                    .id(restroom.getCategory().getId())
                    .name(restroom.getCategory().getName())
                    .icon(restroom.getCategory().getIcon())
                    .color(restroom.getCategory().getColor())
                    .build();
        }

        return RestroomResponseDTO.builder()
                .id(restroom.getId())
                .building(BuildingResponseDTO.from(restroom.getBuilding()))
                .floor(restroom.getFloor())
                .password(decryptedPassword)
                .memo(restroom.getMemo())
                .isFavorite(restroom.getIsFavorite())
                .category(catDTO)
                .creatorNickname(restroom.getUser().getNickname())
                .isCreator(restroom.getUser().getId().equals(currentUserId))
                .createdAt(restroom.getCreatedAt())
                .updatedAt(restroom.getUpdatedAt())
                .build();
    }
}
