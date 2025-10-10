package com.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * 검색 기록 Entity (선택적 기능 - Phase 3)
 * 사용자의 검색 히스토리 저장
 */
@Entity
@Table(name = "search_history", indexes = {
    @Index(name = "idx_user_searched", columnList = "user_id, searched_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SearchHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 검색한 사용자 (다대일 단방향)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false,
                foreignKey = @ForeignKey(name = "fk_search_history_user"))
    private User user;

    /**
     * 검색어
     */
    @Column(name = "search_query", nullable = false)
    private String searchQuery;

    /**
     * 검색일시
     */
    @CreationTimestamp
    @Column(name = "searched_at", nullable = false, updatable = false)
    private LocalDateTime searchedAt;
}
