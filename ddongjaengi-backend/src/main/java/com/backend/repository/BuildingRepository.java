package com.backend.repository;

import com.backend.entity.Building;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface BuildingRepository extends JpaRepository<Building, Long> {

    Optional<Building> findByKakaoPlaceId(String kakaoPlaceId);

    List<Building> findByLatitudeBetweenAndLongitudeBetween(
            BigDecimal southWestLat, BigDecimal northEastLat,
            BigDecimal southWestLng, BigDecimal northEastLng
    );
}
