package com.pricetracker.backend.repository;

import com.pricetracker.backend.model.WebPushSubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface WebPushSubscriptionRepository extends JpaRepository<WebPushSubscription, Long> {
    List<WebPushSubscription> findAllByUserId(Long userId);
    void deleteByEndpoint(String endpoint);
}
