package com.pricetracker.backend.repository;

import com.pricetracker.backend.model.ComparisonGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ComparisonGroupRepository extends JpaRepository<ComparisonGroup, String> {
    List<ComparisonGroup> findByUserIdOrderByCreatedAtDesc(Long userId);
}
