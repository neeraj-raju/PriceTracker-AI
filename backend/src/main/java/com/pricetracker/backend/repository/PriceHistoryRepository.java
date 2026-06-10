package com.pricetracker.backend.repository;

import com.pricetracker.backend.model.PriceHistory;
import com.pricetracker.backend.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.springframework.data.repository.query.Param;
import com.pricetracker.backend.dto.AlertResponse;

@Repository
public interface PriceHistoryRepository extends JpaRepository<PriceHistory, Long> {
    List<PriceHistory> findByProductOrderByCheckedAtAsc(Product product);
    List<PriceHistory> findByProductIdOrderByCheckedAtAsc(Long productId);
    List<PriceHistory> findTop30ByProductIdOrderByCheckedAtDesc(Long productId);

    @Query("SELECT MIN(ph.newPrice) FROM PriceHistory ph WHERE ph.product.id = :productId")
    Optional<BigDecimal> findLowestPriceByProductId(Long productId);

    @Query("SELECT MAX(ph.newPrice) FROM PriceHistory ph WHERE ph.product.id = :productId")
    Optional<BigDecimal> findHighestPriceByProductId(Long productId);

    long countByProductIdAndPriceDroppedTrue(Long productId);
    long countByPriceDroppedTrue();
    @Query("""
SELECT COUNT(ph)
FROM PriceHistory ph
WHERE ph.priceDropped=true
""")
    long getPriceDropCount();

    @Query("SELECT new com.pricetracker.backend.dto.AlertResponse(" +
           "ph.id, p.id, p.name, p.imageUrl, p.website, p.url, ph.oldPrice, ph.newPrice, ph.checkedAt, ut.alertPreference) " +
           "FROM PriceHistory ph " +
           "JOIN ph.product p " +
           "JOIN p.userTrackingList ut " +
           "WHERE ut.user.id = :userId AND ph.priceDropped = true " +
           "AND (ut.status = 'ACTIVE' OR ut.status IS NULL) " +
           "ORDER BY ph.checkedAt DESC")
    List<AlertResponse> findAlertNotificationsByUserId(@Param("userId") Long userId);

}