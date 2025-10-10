package com.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 건물/장소 정보 Entity
 * 카카오맵 API와 연동된 위치 정보
 */
@Entity
@Table(name = "buildings", indexes = {
    @Index(name = "idx_location", columnList = "latitude, longitude"),
    @Index(name = "idx_kakao_place", columnList = "kakao_place_id"),
    @Index(name = "idx_name", columnList = "name")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Building {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "kakao_place_id", length = 50)
    private String kakaoPlaceId;

    @Column(nullable = false)
    private String name;

    @Column(length = 500)
    private String address;

    @Column(name = "road_address", length = 500)
    private String roadAddress;

    @Column(nullable = false, precision = 10, scale = 8)
    private BigDecimal latitude;

    @Column(nullable = false, precision = 11, scale = 8)
    private BigDecimal longitude;

    @Column(length = 20)
    private String phone;

    @Column(length = 100)
    private String category;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * 건물 기본 정보 업데이트
     */
    public void updateInfo(String name, String address, String roadAddress, String phone) {
        if (name != null && !name.isBlank()) {
            this.name = name;
        }
        if (address != null) {
            this.address = address;
        }
        if (roadAddress != null) {
            this.roadAddress = roadAddress;
        }
        if (phone != null) {
            this.phone = phone;
        }
    }

    /**
     * 위치 정보 업데이트
     */
    public void updateLocation(BigDecimal latitude, BigDecimal longitude) {
        if (latitude != null) {
            this.latitude = latitude;
        }
        if (longitude != null) {
            this.longitude = longitude;
        }
    }
}
