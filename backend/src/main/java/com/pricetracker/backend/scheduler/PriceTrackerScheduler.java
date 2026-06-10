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

    @Transactional

    @Scheduled(fixedRate = 300000)
    public void checkPrices() {

        log.info("Scheduler running: Checking product prices...");

        List<Product> products = productRepository.findAll();

        for (Product product : products) {

            try {

                Map<String, Object> scrapedData =
                        scraperFactory
                                .getScraperFor(product.getUrl())
                                .scrape(product.getUrl());

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

                if (newPrice.compareTo(oldPrice) != 0) {
                    boolean priceDropped =
                            newPrice.compareTo(oldPrice) < 0;

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
                    productRepository.save(product);

                    PriceHistory history = new PriceHistory();
                    history.setProduct(product);
                    history.setOldPrice(oldPrice);
                    history.setNewPrice(newPrice);
                    history.setPriceDropped(priceDropped);
                    priceHistoryRepository.save(history);

                    log.info(
                            "Updated product: {} | Old Price: {} | New Price: {}",
                            product.getName(),
                            oldPrice,
                            newPrice
                    );
                } else {
                    log.info("Price unchanged for product: {}", product.getName());
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