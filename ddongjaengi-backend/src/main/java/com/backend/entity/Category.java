package com.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * 카테고리 정보 Entity
 * 사용자가 장소를 분류할 수 있는 카테고리 (회사, 카페, 쇼핑몰 등)
 */
@Entity
@Table(name = "categories", 
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_name", columnNames = "name")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String name;

    @Column(length = 50)
    private String icon;

    @Column(length = 7)
    private String color;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * 카테고리 정보 업데이트
     */
    public void updateInfo(String name, String icon, String color) {
        if (name != null && !name.isBlank()) {
            this.name = name;
        }
        if (icon != null) {
            this.icon = icon;
        }
        if (color != null && isValidHexColor(color)) {
            this.color = color;
        }
    }

    /**
     * HEX 색상 코드 유효성 검사
     */
    private boolean isValidHexColor(String color) {
        return color.matches("^#[0-9A-Fa-f]{6}$");
    }
}
