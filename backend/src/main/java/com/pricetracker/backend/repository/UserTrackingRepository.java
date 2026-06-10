package com.pricetracker.backend.repository;

import com.pricetracker.backend.model.UserTracking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserTrackingRepository extends JpaRepository<UserTracking, Long> {
    List<UserTracking> findByUserId(Long userId);
    Optional<UserTracking> findByUserIdAndProductId(Long userId, Long productId);
    boolean existsByUserIdAndProductId(Long userId, Long productId);
    void deleteByUserIdAndProductId(Long userId, Long productId);
    List<UserTracking> findByProductIdAndAlertEnabledTrue(Long productId);
    long countByProductId(Long productId);

    @Query("SELECT COUNT(ut) FROM UserTracking ut WHERE ut.user.id = :userId AND (ut.status = 'ACTIVE' OR ut.status IS NULL)")
    long countActiveByUserId(@Param("userId") Long userId);
}