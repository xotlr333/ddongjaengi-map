package com.backend.repository;

import com.backend.entity.Building;
import com.backend.entity.Restroom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RestroomRepository extends JpaRepository<Restroom, Long> {

    @Query("select r from Restroom r " +
           "join fetch r.building b " +
           "left join fetch r.category c " +
           "join fetch r.user u " +
           "where b in :buildings")
    List<Restroom> findByBuildingInWithFetchJoin(@Param("buildings") List<Building> buildings);

    @Query("select r from Restroom r " +
           "join fetch r.building b " +
           "left join fetch r.category c " +
           "where r.user.id = :userId and r.isFavorite = true")
    List<Restroom> findFavoritesByUserIdWithFetchJoin(@Param("userId") Long userId);

    @Query("select r from Restroom r " +
           "join fetch r.building b " +
           "left join fetch r.category c " +
           "where r.user.id = :userId")
    List<Restroom> findByUserIdWithFetchJoin(@Param("userId") Long userId);
}
