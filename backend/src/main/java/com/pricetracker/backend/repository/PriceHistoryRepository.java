package com.pricetracker.backend.repository;

import com.pricetracker.backend.model.PriceHistory;
import com.pricetracker.backend.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

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
}