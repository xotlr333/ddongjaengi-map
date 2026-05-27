package com.backend.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RestroomCreateRequestDTO {

    private BuildingDTO building;
    private String floor;
    private String password;
    private String memo;
    private Long categoryId;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BuildingDTO {
        private String kakaoPlaceId;
        private String name;
        private String address;
        private String roadAddress;
        private BigDecimal latitude;
        private BigDecimal longitude;
        private String phone;
        private String category;
    }
}
