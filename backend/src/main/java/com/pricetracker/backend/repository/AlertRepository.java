package com.pricetracker.backend.repository;

import com.pricetracker.backend.model.Alert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.domain.Pageable;

@Repository
public interface AlertRepository extends JpaRepository<Alert, Long> {
    List<Alert> findTop8ByOrderByCreatedAtDesc();
    java.util.Optional<Alert> findFirstByProductIdOrderByCreatedAtDesc(Long productId);

    @Query("""
           SELECT a
           FROM Alert a
           WHERE a.alertType IN ('SIGNIFICANT_DROP', 'ALL_TIME_LOW', 'TARGET_PRICE_REACHED')
           AND EXISTS (
               SELECT 1 FROM UserTracking ut
               WHERE ut.product.id = a.productId
               AND (ut.status = 'ACTIVE' OR ut.status IS NULL)
           )
           ORDER BY a.createdAt DESC
           """)
    List<Alert> findActiveAlerts(Pageable pageable);

    @Query("""
           SELECT COUNT(a) FROM Alert a
           WHERE a.platform = :platform
           AND a.alertType IN ('SIGNIFICANT_DROP', 'ALL_TIME_LOW', 'TARGET_PRICE_REACHED')
           AND EXISTS (
               SELECT 1 FROM UserTracking ut
               WHERE ut.product.id = a.productId
               AND (ut.status = 'ACTIVE' OR ut.status IS NULL)
           )
           """)
    long countAlertsByPlatform(@org.springframework.data.repository.query.Param("platform") String platform);
}
