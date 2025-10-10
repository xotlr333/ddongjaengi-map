package com.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * 화장실 정보 Entity (핵심 테이블)
 * 사용자가 등록한 화장실 비밀번호 및 관련 정보
 */
@Entity
@Table(name = "restrooms", indexes = {
    @Index(name = "idx_user_building", columnList = "user_id, building_id"),
    @Index(name = "idx_updated_at", columnList = "updated_at"),
    @Index(name = "idx_favorites", columnList = "user_id, is_favorite"),
    @Index(name = "idx_user_created", columnList = "user_id, created_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Restroom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 건물 정보 (다대일 단방향)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "building_id", nullable = false, 
                foreignKey = @ForeignKey(name = "fk_restrooms_building"))
    private Building building;

    /**
     * 등록 사용자 (다대일 단방향)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false,
                foreignKey = @ForeignKey(name = "fk_restrooms_user"))
    private User user;

    /**
     * 카테고리 (다대일 단방향, 선택적)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id",
                foreignKey = @ForeignKey(name = "fk_restrooms_category"))
    private Category category;

    /**
     * 층수 정보 (예: B1, 1F, 2F, 10층 등)
     */
    @Column(length = 10)
    private String floor;

    /**
     * 암호화된 비밀번호
     * 주의: 반드시 AES 암호화 후 저장
     */
    @Column(name = "password_encrypted", columnDefinition = "TEXT")
    private String passwordEncrypted;

    /**
     * 사용자 메모
     */
    @Column(columnDefinition = "TEXT")
    private String memo;

    /**
     * 즐겨찾기 여부
     */
    @Column(name = "is_favorite", nullable = false)
    @Builder.Default
    private Boolean isFavorite = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    /**
     * 즐겨찾기 토글
     */
    public void toggleFavorite() {
        this.isFavorite = !this.isFavorite;
    }

    /**
     * 즐겨찾기 설정
     */
    public void setFavorite(boolean favorite) {
        this.isFavorite = favorite;
    }

    /**
     * 화장실 전체 정보 업데이트
     */
    public void updateInfo(String floor, String passwordEncrypted, String memo, Category category) {
        if (floor != null) {
            this.floor = floor;
        }
        if (passwordEncrypted != null) {
            this.passwordEncrypted = passwordEncrypted;
        }
        if (memo != null) {
            this.memo = memo;
        }
        if (category != null) {
            this.category = category;
        }
    }

    /**
     * 비밀번호만 업데이트
     * 주의: 이미 암호화된 비밀번호를 전달해야 함
     */
    public void updatePassword(String encryptedPassword) {
        if (encryptedPassword != null && !encryptedPassword.isBlank()) {
            this.passwordEncrypted = encryptedPassword;
        }
    }

    /**
     * 메모만 업데이트
     */
    public void updateMemo(String memo) {
        this.memo = memo;
    }

    /**
     * 층수만 업데이트
     */
    public void updateFloor(String floor) {
        this.floor = floor;
    }

    /**
     * 카테고리만 변경
     */
    public void changeCategory(Category category) {
        this.category = category;
    }
}
