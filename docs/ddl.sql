-- ============================================
-- 똥쟁이 지도 (Restroom Password Map)
-- MySQL Database DDL
-- Version: 1.0
-- MySQL: 8.0+
-- ============================================

-- 데이터베이스 생성 (필요한 경우)
-- CREATE DATABASE IF NOT EXISTS ddongjaengi 
-- CHARACTER SET utf8mb4 
-- COLLATE utf8mb4_unicode_ci;

-- USE ddongjaengi;

-- ============================================
-- Phase 1: 기본 테이블 생성 (MVP)
-- ============================================

-- --------------------------------------------
-- 1. users 테이블 (사용자 정보)
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '사용자 고유 ID',
    kakao_id BIGINT UNIQUE NOT NULL COMMENT '카카오 사용자 ID',
    email VARCHAR(100) COMMENT '이메일 주소',
    nickname VARCHAR(50) NOT NULL COMMENT '사용자 닉네임',
    profile_image_url VARCHAR(500) COMMENT '프로필 이미지 URL',
    is_active BOOLEAN DEFAULT TRUE COMMENT '계정 활성화 상태',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '계정 생성일시',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '정보 수정일시',
    last_login TIMESTAMP NULL COMMENT '마지막 로그인 일시',
    
    INDEX idx_kakao_id (kakao_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB 
  DEFAULT CHARSET=utf8mb4 
  COLLATE=utf8mb4_unicode_ci 
  COMMENT='사용자 정보 테이블';

-- --------------------------------------------
-- 2. buildings 테이블 (건물/장소 정보)
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS buildings (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '건물 고유 ID',
    kakao_place_id VARCHAR(50) COMMENT '카카오맵 장소 ID',
    name VARCHAR(255) NOT NULL COMMENT '건물/장소명',
    address VARCHAR(500) COMMENT '지번 주소',
    road_address VARCHAR(500) COMMENT '도로명 주소',
    latitude DECIMAL(10,8) NOT NULL COMMENT '위도',
    longitude DECIMAL(11,8) NOT NULL COMMENT '경도',
    phone VARCHAR(20) COMMENT '전화번호',
    category VARCHAR(100) COMMENT '장소 카테고리',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '등록일시',
    
    INDEX idx_location (latitude, longitude),
    INDEX idx_kakao_place (kakao_place_id),
    INDEX idx_name (name)
) ENGINE=InnoDB 
  DEFAULT CHARSET=utf8mb4 
  COLLATE=utf8mb4_unicode_ci 
  COMMENT='건물/장소 정보 테이블';

-- --------------------------------------------
-- 3. categories 테이블 (카테고리)
-- Phase 2에서 사용하지만 미리 생성
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '카테고리 고유 ID',
    name VARCHAR(50) NOT NULL COMMENT '카테고리명',
    icon VARCHAR(50) COMMENT '아이콘 이름',
    color VARCHAR(7) COMMENT '색상 코드 (#FFFFFF)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    
    UNIQUE KEY uk_name (name)
) ENGINE=InnoDB 
  DEFAULT CHARSET=utf8mb4 
  COLLATE=utf8mb4_unicode_ci 
  COMMENT='카테고리 테이블';

-- --------------------------------------------
-- 4. restrooms 테이블 (화장실 정보)
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS restrooms (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '화장실 정보 고유 ID',
    building_id BIGINT NOT NULL COMMENT '건물 ID',
    user_id BIGINT NOT NULL COMMENT '등록 사용자 ID',
    category_id BIGINT COMMENT '개인 카테고리 ID',
    floor VARCHAR(10) COMMENT '층수 정보',
    password_encrypted TEXT COMMENT '암호화된 비밀번호',
    memo TEXT COMMENT '사용자 메모',
    is_favorite BOOLEAN DEFAULT FALSE COMMENT '즐겨찾기 여부',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '등록일시',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
    
    CONSTRAINT fk_restrooms_building 
        FOREIGN KEY (building_id) 
        REFERENCES buildings(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT fk_restrooms_user 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT fk_restrooms_category 
        FOREIGN KEY (category_id) 
        REFERENCES categories(id) 
        ON DELETE SET NULL,
    
    INDEX idx_user_building (user_id, building_id),
    INDEX idx_updated_at (updated_at),
    INDEX idx_favorites (user_id, is_favorite),
    INDEX idx_user_created (user_id, created_at)
) ENGINE=InnoDB 
  DEFAULT CHARSET=utf8mb4 
  COLLATE=utf8mb4_unicode_ci 
  COMMENT='화장실 정보 테이블';

-- ============================================
-- Phase 3: 선택적 테이블 (검색 기록)
-- ============================================

-- --------------------------------------------
-- 5. search_history 테이블 (검색 기록)
-- 필요시 주석 해제하여 사용
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS search_history (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '검색 기록 고유 ID',
    user_id BIGINT NOT NULL COMMENT '사용자 ID',
    search_query VARCHAR(255) NOT NULL COMMENT '검색어',
    searched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '검색일시',
    
    CONSTRAINT fk_search_history_user 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE,
    
    INDEX idx_user_searched (user_id, searched_at)
) ENGINE=InnoDB 
  DEFAULT CHARSET=utf8mb4 
  COLLATE=utf8mb4_unicode_ci 
  COMMENT='검색 기록 테이블';

-- ============================================
-- 기본 데이터 삽입
-- ============================================

-- 기본 카테고리 데이터 삽입
INSERT INTO categories (name, icon, color) VALUES
('회사', 'building', '#2196F3'),
('카페', 'coffee', '#FF9800'),
('쇼핑몰', 'shopping', '#E91E63'),
('공공시설', 'government', '#4CAF50'),
('기타', 'location', '#9E9E9E')
ON DUPLICATE KEY UPDATE 
    icon = VALUES(icon),
    color = VALUES(color);

-- ============================================
-- 유용한 쿼리 예시
-- ============================================

-- 1. 사용자별 화장실 정보 조회 (최근 20개)
/*
SELECT 
    r.id,
    r.floor,
    r.memo,
    r.is_favorite,
    r.created_at,
    r.updated_at,
    b.name AS building_name,
    b.address,
    b.road_address,
    b.latitude,
    b.longitude,
    c.name AS category_name,
    c.icon AS category_icon,
    c.color AS category_color
FROM restrooms r
JOIN buildings b ON r.building_id = b.id
LEFT JOIN categories c ON r.category_id = c.id
WHERE r.user_id = ?
ORDER BY r.updated_at DESC
LIMIT 20;
*/

-- 2. 특정 위치 근처 화장실 검색 (위도/경도 기준)
/*
SELECT 
    r.id,
    r.floor,
    r.is_favorite,
    b.name,
    b.address,
    b.latitude,
    b.longitude,
    (6371 * acos(
        cos(radians(?)) * cos(radians(b.latitude)) *
        cos(radians(b.longitude) - radians(?)) +
        sin(radians(?)) * sin(radians(b.latitude))
    )) AS distance
FROM restrooms r
JOIN buildings b ON r.building_id = b.id
WHERE r.user_id = ?
HAVING distance < 1  -- 1km 이내
ORDER BY distance
LIMIT 10;
*/

-- 3. 카테고리별 화장실 개수 조회
/*
SELECT 
    c.name AS category_name,
    COUNT(r.id) AS restroom_count
FROM categories c
LEFT JOIN restrooms r ON c.id = r.category_id AND r.user_id = ?
GROUP BY c.id, c.name
ORDER BY restroom_count DESC;
*/

-- 4. 즐겨찾기 화장실 목록
/*
SELECT 
    r.id,
    b.name AS building_name,
    b.address,
    r.floor,
    c.name AS category_name
FROM restrooms r
JOIN buildings b ON r.building_id = b.id
LEFT JOIN categories c ON r.category_id = c.id
WHERE r.user_id = ? AND r.is_favorite = TRUE
ORDER BY b.name;
*/

-- ============================================
-- 성능 최적화 팁
-- ============================================

-- 1. 슬로우 쿼리 로그 활성화 (필요시)
-- SET GLOBAL slow_query_log = 'ON';
-- SET GLOBAL long_query_time = 2;

-- 2. 인덱스 사용 확인
-- EXPLAIN SELECT ... 명령어 사용

-- 3. 테이블 상태 확인
-- SHOW TABLE STATUS LIKE 'restrooms';

-- 4. 인덱스 최적화
-- ANALYZE TABLE restrooms;
-- OPTIMIZE TABLE restrooms;