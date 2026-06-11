package com.pricetracker.backend.service;

import com.pricetracker.backend.model.WebPushSubscription;
import com.pricetracker.backend.repository.WebPushSubscriptionRepository;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import nl.martijndwars.webpush.Notification;
import nl.martijndwars.webpush.PushService;
import nl.martijndwars.webpush.Subscription;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.bouncycastle.jce.interfaces.ECPrivateKey;
import org.bouncycastle.jce.interfaces.ECPublicKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import jakarta.annotation.PostConstruct;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.Security;
import java.security.spec.ECGenParameterSpec;
import java.util.Base64;
import java.util.List;

@Service
@Slf4j
public class WebPushService {

    private final WebPushSubscriptionRepository subscriptionRepository;
    private PushService pushService;

    @Getter
    private String activePublicKey;

    @Value("${vapid.public.key:}")
    private String publicKey;

    @Value("${vapid.private.key:}")
    private String privateKey;

    @Value("${vapid.subject:mailto:placeholder-email@gmail.com}")
    private String subject;

    public WebPushService(WebPushSubscriptionRepository subscriptionRepository) {
        this.subscriptionRepository = subscriptionRepository;
    }

    @PostConstruct
    public void init() {
        // Add BouncyCastle provider required by web-push encryption
        Security.addProvider(new BouncyCastleProvider());

        if (publicKey == null || publicKey.trim().isEmpty() || privateKey == null || privateKey.trim().isEmpty()) {
            log.info("[🔔 WEB PUSH] VAPID keys are blank. Generating a secure keypair dynamically for this session...");
            try {
                // Generate EC KeyPair using BouncyCastle
                KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance("ECDH", "BC");
                keyPairGenerator.initialize(new ECGenParameterSpec("secp256r1"));
                KeyPair keyPair = keyPairGenerator.generateKeyPair();

                ECPublicKey ecPubKey = (ECPublicKey) keyPair.getPublic();
                ECPrivateKey ecPrivKey = (ECPrivateKey) keyPair.getPrivate();

                // Extract uncompressed public key bytes (65 bytes, first byte is 0x04)
                byte[] publicKeyBytes = ecPubKey.getQ().getEncoded(false);

                // Extract private key bytes (exactly 32 bytes)
                byte[] privateKeyBytes = new byte[32];
                byte[] rawPrivateBytes = ecPrivKey.getD().toByteArray();
                if (rawPrivateBytes.length > 32) {
                    System.arraycopy(rawPrivateBytes, rawPrivateBytes.length - 32, privateKeyBytes, 0, 32);
                } else {
                    System.arraycopy(rawPrivateBytes, 0, privateKeyBytes, 32 - rawPrivateBytes.length, rawPrivateBytes.length);
                }

                // Base64URL-Safe encoding without padding
                String base64PublicKey = Base64.getUrlEncoder().withoutPadding().encodeToString(publicKeyBytes);
                String base64PrivateKey = Base64.getUrlEncoder().withoutPadding().encodeToString(privateKeyBytes);

                log.info("\n============================================================\n" +
                         "[🔔 DYNAMIC VAPID KEYS GENERATED FOR THIS SESSION]\n" +
                         "Public Key (Use in Frontend): {}\n" +
                         "Private Key (Use in Backend): {}\n" +
                         "============================================================",
                         base64PublicKey, base64PrivateKey);

                pushService = new PushService(base64PublicKey, base64PrivateKey, subject);
                this.activePublicKey = base64PublicKey;
            } catch (Exception e) {
                log.error("[🔔 WEB PUSH] Failed to generate VAPID keys dynamically: ", e);
            }
        } else {
            try {
                pushService = new PushService(publicKey, privateKey, subject);
                this.activePublicKey = publicKey;
                log.info("[🔔 WEB PUSH] PushService initialized successfully with configured VAPID keys!");
            } catch (Exception e) {
                log.error("[🔔 WEB PUSH] Failed to load configured VAPID keys: ", e);
            }
        }
    }

    /**
     * Dispatches secure web push notifications to all browser endpoints registered by the user.
     */
    public void sendPushNotification(Long userId, String title, String body, String redirectUrl) {
        List<WebPushSubscription> subs = subscriptionRepository.findAllByUserId(userId);
        if (subs.isEmpty()) {
            log.info("[🔔 WEB PUSH] No browser push subscriptions found for User ID: {}", userId);
            return;
        }

        // Create standard JSON payload
        String payload = String.format("{\"title\":\"%s\",\"body\":\"%s\",\"url\":\"%s\"}", title, body, redirectUrl);

        log.info("[🔔 WEB PUSH] Preparing to dispatch push events to {} endpoints for User ID: {}", subs.size(), userId);

        for (WebPushSubscription sub : subs) {
            try {
                // Initialize web-push subscription properties
                Subscription subscription = new Subscription(
                        sub.getEndpoint(),
                        new Subscription.Keys(sub.getP256dh(), sub.getAuth())
                );

                Notification notification = new Notification(subscription, payload);

                // Send encrypted push event
                pushService.send(notification);
                log.info("[🔔 WEB PUSH SENT SECURELY] Successfully delivered push alert to browser endpoint: {}", sub.getEndpoint());

            } catch (Exception e) {
                log.warn("[🔔 WEB PUSH CLEANUP] Browser endpoint rejected or expired. Removing stale subscription ID: {}. Error: {}", sub.getId(), e.getMessage());
                try {
                    subscriptionRepository.delete(sub);
                } catch (Exception dbEx) {
                    log.error("Failed to delete stale subscription: ", dbEx);
                }
            }
        }
    }
}
