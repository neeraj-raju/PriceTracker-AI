package com.pricetracker.backend.repository;

import com.pricetracker.backend.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    Optional<Product> findByUrl(String url);

    boolean existsByUrl(String url);

    List<Product> findByWebsite(String website);
    List<Product> findAllByUrl(String url);

    @Query("""
           SELECT p
           FROM Product p
           JOIN UserTracking ut
           ON ut.product = p
           WHERE ut.user.id = :userId
           AND (ut.status = 'ACTIVE' OR ut.status IS NULL)
           """)
    List<Product> findAllByUserId(Long userId);

    @Query("""
           SELECT p
           FROM Product p
           JOIN UserTracking ut
           ON ut.product = p
           WHERE ut.user.id = :userId
           AND p.url = :url
           AND (ut.status = 'ACTIVE' OR ut.status IS NULL)
           """)
    Optional<Product> findTrackedProduct(
            Long userId,
            String url
    );
}