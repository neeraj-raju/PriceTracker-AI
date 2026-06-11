package com.pricetracker.backend.scheduler;

import org.springframework.transaction.annotation.Transactional;
import com.pricetracker.backend.model.PriceHistory;
import com.pricetracker.backend.model.Product;
import com.pricetracker.backend.repository.PriceHistoryRepository;
import com.pricetracker.backend.repository.ProductRepository;
import com.pricetracker.backend.scraper.ScraperFactory;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import com.pricetracker.backend.service.EmailService;
import com.pricetracker.backend.service.WebPushService;
import com.pricetracker.backend.service.StatsService;
import com.pricetracker.backend.service.AIAnalysisService;
import com.pricetracker.backend.model.Alert;
import com.pricetracker.backend.repository.AlertRepository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class PriceTrackerScheduler {

    private final ProductRepository productRepository;
    private final PriceHistoryRepository priceHistoryRepository;
    private final ScraperFactory scraperFactory;
    private final EmailService emailService;
    private final WebPushService webPushService;
    private final AlertRepository alertRepository;
    private final StatsService statsService;
    private final AIAnalysisService aiAnalysisService;

    @Transactional

    @Scheduled(fixedRate = 300000)
    public void checkPrices() {

        log.info("Scheduler running: Checking product prices...");

        List<Product> products = productRepository.findActivelyTrackedProducts();

        for (Product product : products) {

            try {

                Map<String, Object> scrapedData =
                        scraperFactory
                                .getScraperFor(product.getUrl())
                                .scrape(product.getUrl());

                if (scrapedData == null) {
                    log.warn("Scraped data is null for product: {}. Skipping scheduler update.", product.getName());
                    continue;
                }

                Object priceObj = scrapedData.get("price");

                if (priceObj == null) {
                    continue;
                }

                BigDecimal newPrice =
                        new BigDecimal(priceObj.toString());

                if (newPrice.compareTo(BigDecimal.ZERO) <= 0) {
                    log.warn("Scraped price is 0 or negative for product: {}. Skipping scheduler update.", product.getName());
                    continue;
                }

                BigDecimal oldPrice =
                        product.getCurrentPrice();

                String oldAvailability = product.getAvailability();
                String newAvailability = scrapedData.get("availability") != null ? scrapedData.get("availability").toString() : "In Stock";

                boolean wasOutOfStock = oldAvailability != null && (oldAvailability.toLowerCase().contains("out") || oldAvailability.toLowerCase().contains("unavail") || oldAvailability.toLowerCase().contains("out of stock"));
                boolean isCurrentlyInStock = newAvailability != null && !(newAvailability.toLowerCase().contains("out") || newAvailability.toLowerCase().contains("unavail") || newAvailability.toLowerCase().contains("out of stock"));
                boolean backInStock = wasOutOfStock && isCurrentlyInStock;

                if (newPrice.compareTo(oldPrice) != 0 || backInStock) {
                    boolean priceDropped = newPrice.compareTo(oldPrice) < 0;

                    // Save Alert to database
                    String alertType = "SIGNIFICANT_DROP";
                    double dropPercent = 0.0;

                    if (backInStock) {
                        alertType = "BACK_IN_STOCK";
                    } else if (newPrice.compareTo(oldPrice) > 0) {
                        alertType = "PRICE_RISING_WARNING";
                    } else { // priceDropped
                        dropPercent = ((oldPrice.subtract(newPrice)).doubleValue() / oldPrice.doubleValue()) * 100.0;
                        BigDecimal lowestEver = priceHistoryRepository.findLowestPriceByProductId(product.getId()).orElse(oldPrice);
                        if (newPrice.compareTo(lowestEver) < 0) {
                            alertType = "ALL_TIME_LOW";
                        } else {
                            boolean targetReached = product.getUserTrackingList().stream()
                                    .anyMatch(ut -> "ACTIVE".equalsIgnoreCase(ut.getStatus()) && ut.getTargetPrice() != null && newPrice.compareTo(ut.getTargetPrice()) <= 0);
                            if (targetReached) {
                                alertType = "TARGET_PRICE_REACHED";
                            }
                        }
                    }

                    boolean isDuplicateAlert = false;
                    java.util.Optional<Alert> lastAlertOpt = alertRepository.findFirstByProductIdOrderByCreatedAtDesc(product.getId());
                    if (lastAlertOpt.isPresent()) {
                        Alert lastAlert = lastAlertOpt.get();
                        if (lastAlert.getAlertType().equals(alertType) && 
                            lastAlert.getCreatedAt() != null && 
                            lastAlert.getCreatedAt().isAfter(java.time.LocalDateTime.now().minusMinutes(30))) {
                            isDuplicateAlert = true;
                        }
                    }

                    if (!isDuplicateAlert) {
                        Alert alertEntity = Alert.builder()
                                .alertType(alertType)
                                .platform(product.getWebsite())
                                .dropPercent(dropPercent)
                                .productId(product.getId())
                                .build();
                        alertRepository.save(alertEntity);
                    }

                    if (priceDropped) {

                        product.getUserTrackingList()
                                .forEach(
                                        tracking -> {
                                            // Only alert if the tracking is currently ACTIVE
                                            if (!"ACTIVE".equalsIgnoreCase(tracking.getStatus())) {
                                                return;
                                            }

                                            // Only alert if alert notifications are enabled
                                            if (tracking.getAlertEnabled() != null && !tracking.getAlertEnabled()) {
                                                return;
                                            }

                                            // 1. Target price logic: If targetPrice is set, only alert if newPrice <= targetPrice
                                            if (tracking.getTargetPrice() != null && newPrice.compareTo(tracking.getTargetPrice()) > 0) {
                                                return;
                                            }

                                            // 2. Alert Dispatcher based on alertPreference
                                            String pref = tracking.getAlertPreference() != null ? tracking.getAlertPreference() : "EMAIL";

                                            if ("EMAIL".equalsIgnoreCase(pref) || "BOTH".equalsIgnoreCase(pref)) {
                                                try {
                                                    emailService.sendPriceDropEmail(
                                                            tracking.getUser().getEmail(),
                                                            product.getName(),
                                                            oldPrice.toString(),
                                                            newPrice.toString(),
                                                            product.getUrl()
                                                    );
                                                } catch (Exception e) {
                                                    log.error("Failed to send price drop email for product: {}", product.getName(), e);
                                                }
                                            }

                                             if ("PUSH".equalsIgnoreCase(pref) || "BOTH".equalsIgnoreCase(pref)) {
                                                 try {
                                                     webPushService.sendPushNotification(
                                                             tracking.getUser().getId(),
                                                             "📉 Price Drop Alert!",
                                                             String.format("The price of '%s' dropped to ₹%s!", product.getName(), newPrice),
                                                             product.getUrl()
                                                     );
                                                 } catch (Exception e) {
                                                     log.error("Failed to send Web Push alert for product: {}", product.getName(), e);
                                                 }
                                             }
                                        }
                                );

                        log.info(
                                "Price drop alerts sent for product: {}",
                                product.getName()
                        );
                    }

                    product.setCurrentPrice(newPrice);
                    product.setAvailability(newAvailability);
                    productRepository.save(product);

                    PriceHistory history = new PriceHistory();
                    history.setProduct(product);
                    history.setOldPrice(oldPrice);
                    history.setNewPrice(newPrice);
                    history.setPriceDropped(priceDropped);
                    priceHistoryRepository.save(history);

                    aiAnalysisService.invalidateCache(product.getId());
                    statsService.invalidateCache();

                    log.info(
                            "Updated product: {} | Old Price: {} | New Price: {} | Availability: {}",
                            product.getName(),
                            oldPrice,
                            newPrice,
                            newAvailability
                    );
                } else {
                    log.info("Price and availability unchanged for product: {}", product.getName());
                }

            } catch (Exception e) {

                log.error(
                        "Error checking product: {}",
                        product.getUrl(),
                        e
                );
            }
        }
    }
}