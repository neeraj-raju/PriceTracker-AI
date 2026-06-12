package com.pricetracker.backend.service;

import com.pricetracker.backend.model.*;
import com.pricetracker.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final UserTrackingRepository userTrackingRepository;
    private final ComparisonGroupRepository comparisonGroupRepository;
    private final WebPushSubscriptionRepository webPushSubscriptionRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public void changePassword(User user, String currentPassword, String newPassword) {
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new RuntimeException("Incorrect current password.");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        log.info("Successfully changed password for user ID: {}", user.getId());
    }

    @Transactional
    public void deleteUserAccount(Long userId) {
        log.info("Starting deletion of user account: {}", userId);

        // 1. Delete all WebPushSubscriptions for this user
        List<WebPushSubscription> subscriptions = webPushSubscriptionRepository.findAllByUserId(userId);
        if (!subscriptions.isEmpty()) {
            log.info("Deleting {} web push subscriptions", subscriptions.size());
            webPushSubscriptionRepository.deleteAll(subscriptions);
        }

        // 2. Dissociate and delete all ComparisonGroups for this user
        List<ComparisonGroup> groups = comparisonGroupRepository.findByUserIdOrderByCreatedAtDesc(userId);
        if (!groups.isEmpty()) {
            log.info("Dissociating {} comparison groups", groups.size());
            for (ComparisonGroup group : groups) {
                if (group.getTrackedProducts() != null) {
                    for (UserTracking ut : group.getTrackedProducts()) {
                        ut.setComparisonGroup(null);
                        userTrackingRepository.save(ut);
                    }
                }
            }
            // Force save updates before deleting parent groups to prevent database FK violations
            userTrackingRepository.flush();
            
            log.info("Deleting {} comparison groups", groups.size());
            comparisonGroupRepository.deleteAll(groups);
            comparisonGroupRepository.flush();
        }

        // 3. Finally, delete the User entity (Hibernate will cascade-delete the user's trackingList automatically)
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        userRepository.delete(user);

        log.info("Successfully deleted user account: {}", userId);
    }
}
