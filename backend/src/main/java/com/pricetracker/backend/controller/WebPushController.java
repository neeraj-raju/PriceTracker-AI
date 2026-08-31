package com.pricetracker.backend.controller;

import com.pricetracker.backend.model.User;
import com.pricetracker.backend.model.WebPushSubscription;
import com.pricetracker.backend.repository.UserRepository;
import com.pricetracker.backend.repository.WebPushSubscriptionRepository;
import com.pricetracker.backend.service.WebPushService;
import lombok.Data;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class WebPushController {

    private final WebPushSubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;
    private final WebPushService webPushService;

    public WebPushController(
            WebPushSubscriptionRepository subscriptionRepository,
            UserRepository userRepository,
            WebPushService webPushService
    ) {
        this.subscriptionRepository = subscriptionRepository;
        this.userRepository = userRepository;
        this.webPushService = webPushService;
    }

    @GetMapping("/vapid-public-key")
    public ResponseEntity<?> getPublicKey() {
        String key = webPushService.getActivePublicKey();
        return ResponseEntity.ok(Map.of("publicKey", key != null ? key : ""));
    }

    @PostMapping("/subscribe")
    public ResponseEntity<?> subscribe(
            @RequestBody SubscriptionPayload payload,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Save new subscription mapping
        WebPushSubscription sub = WebPushSubscription.builder()
                .user(user)
                .endpoint(payload.getEndpoint())
                .p256dh(payload.getKeys().getP256dh())
                .auth(payload.getKeys().getAuth())
                .build();

        subscriptionRepository.save(sub);
        return ResponseEntity.ok(Map.of("message", "Browser Web Push subscription registered successfully!"));
    }

    @Data
    public static class SubscriptionPayload {
        private String endpoint;
        private Keys keys;

        @Data
        public static class Keys {
            private String p256dh;
            private String auth;
        }
    }
}
