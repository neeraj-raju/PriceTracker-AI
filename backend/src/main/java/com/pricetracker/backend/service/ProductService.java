package com.pricetracker.backend.service;


import com.pricetracker.backend.dto.AlertResponse;
import com.pricetracker.backend.dto.TrackProductRequest;
import com.pricetracker.backend.model.PriceHistory;
import com.pricetracker.backend.model.Product;
import com.pricetracker.backend.repository.PriceHistoryRepository;
import com.pricetracker.backend.repository.ProductRepository;
import com.pricetracker.backend.scraper.ScraperFactory;
import com.pricetracker.backend.model.User;
import com.pricetracker.backend.model.UserTracking;
import com.pricetracker.backend.repository.UserTrackingRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.HashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductService {

    private final ProductRepository productRepository;

    private final PriceHistoryRepository
            priceHistoryRepository;

    private final ScraperFactory scraperFactory;
    private final UserTrackingRepository
            userTrackingRepository;
    private final EmailService emailService;
    private final WebPushService webPushService;

    public Product trackProduct(
            TrackProductRequest request,
            User user
    ) {
        Optional<Product> alreadyTracked =
                productRepository.findTrackedProduct(
                        user.getId(),
                        request.getUrl()
                );

        if (alreadyTracked.isPresent()) {
            throw new RuntimeException("Already tracking this product");
        }

        Optional<Product> existingProduct = productRepository.findByUrl(request.getUrl());
        Product product;
        boolean isNewProduct = false;

        if (existingProduct.isPresent()) {
            product = existingProduct.get();
        } else {
            Map<String, Object> scrapedData;
            try {
                scrapedData = scraperFactory
                        .getScraperFor(request.getUrl())
                        .scrape(request.getUrl());
            } catch (Exception e) {
                throw new RuntimeException("Failed to locate a matching scraper strategy for this store URL.");
            }

            String nameStr = scrapedData != null ? scrapedData.get("name").toString() : "";
            if (scrapedData == null 
                    || nameStr.trim().isEmpty() 
                    || nameStr.toLowerCase().contains("unknown") 
                    || "0".equals(scrapedData.get("price").toString())) {
                throw new RuntimeException("Failed to extract product details. Please verify the link is a valid, active product page.");
            }

            product = new Product();
            product.setUrl(request.getUrl());
            product.setName(scrapedData.get("name").toString());
            product.setCurrentPrice(new BigDecimal(scrapedData.get("price").toString()));
            product.setImageUrl(scrapedData.get("imageUrl") != null ? scrapedData.get("imageUrl").toString() : "");
            product.setWebsite(scrapedData.get("website") != null ? scrapedData.get("website").toString() : "AMAZON");
            product.setAvailability(scrapedData.get("availability") != null ? scrapedData.get("availability").toString() : "In Stock");
            
            product = productRepository.save(product);
            isNewProduct = true;
        }

        UserTracking tracking = new UserTracking();
        tracking.setUser(user);
        tracking.setProduct(product);
        tracking.setTargetPrice(request.getTargetPrice());
        if (request.getAlertPreference() != null) {
            tracking.setAlertPreference(request.getAlertPreference());
        } else {
            tracking.setAlertPreference("EMAIL");
        }

        userTrackingRepository.save(tracking);

        if (isNewProduct) {
            PriceHistory history = new PriceHistory();
            history.setProduct(product);
            history.setOldPrice(product.getCurrentPrice());
            history.setNewPrice(product.getCurrentPrice());
            history.setPriceDropped(false);
            priceHistoryRepository.save(history);
        }

        return product;

    }

    public List<Product> getAllProducts() {

        return productRepository.findAll();

    }
    @Transactional
    public void removeUserTracking(Long userId, Long productId) {
        userTrackingRepository.deleteByUserIdAndProductId(userId, productId);

        // If no more users are tracking this product, delete it globally to clean up the DB
        if (userTrackingRepository.countByProductId(productId) == 0) {
            productRepository.deleteById(productId);
        }
    }

    public List<PriceHistory> getPriceHistory(
            Long productId
    ) {

        return
                priceHistoryRepository
                        .findByProductIdOrderByCheckedAtAsc(
                                productId
                        );

    }

    public Map<String, Long> getDashboardStats(Long userId) {
        Map<String, Long> stats = new HashMap<>();

        long trackedProductsCount = userTrackingRepository.findByUserId(userId).size();
        stats.put("trackedProducts", trackedProductsCount);

        List<AlertResponse> userAlerts = priceHistoryRepository.findAlertNotificationsByUserId(userId);
        long alertsCount = userAlerts != null ? userAlerts.size() : 0;
        stats.put("priceDrops", alertsCount);
        stats.put("alertsSent", alertsCount);

        return stats;
    }

    public List<Product>
    getUserProducts(
            Long userId
    ){

        return
                productRepository
                        .findAllByUserId(
                                userId
                        );

    }

    public void triggerTestAlert(Long productId, User user) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        UserTracking tracking = userTrackingRepository.findByUserIdAndProductId(user.getId(), productId)
                .orElseThrow(() -> new RuntimeException("Tracking record not found"));

        BigDecimal oldPrice = product.getCurrentPrice();
        BigDecimal newPrice = oldPrice.multiply(new BigDecimal("0.90")).setScale(2, RoundingMode.HALF_UP);

        if (tracking.getTargetPrice() != null && newPrice.compareTo(tracking.getTargetPrice()) > 0) {
            newPrice = tracking.getTargetPrice().subtract(new BigDecimal("10.00")).setScale(2, RoundingMode.HALF_UP);
        }

        PriceHistory history = new PriceHistory();
        history.setProduct(product);
        history.setOldPrice(oldPrice);
        history.setNewPrice(newPrice);
        history.setPriceDropped(true);
        priceHistoryRepository.save(history);

        product.setCurrentPrice(newPrice);
        productRepository.save(product);

        String pref = tracking.getAlertPreference() != null ? tracking.getAlertPreference() : "EMAIL";

        try {
            if ("EMAIL".equalsIgnoreCase(pref) || "BOTH".equalsIgnoreCase(pref)) {
                emailService.sendPriceDropEmail(
                        user.getEmail(),
                        product.getName(),
                        oldPrice.toString(),
                        newPrice.toString(),
                        product.getUrl()
                );
            }
        } catch (Exception e) {
            log.error("SMTP Mail Send Exception in test alert simulation: ", e);
        }

        try {
            if ("PUSH".equalsIgnoreCase(pref) || "BOTH".equalsIgnoreCase(pref)) {
                webPushService.sendPushNotification(
                        user.getId(),
                        "📉 Price Drop Alert!",
                        String.format("The price of '%s' dropped to ₹%s!", product.getName(), newPrice),
                        product.getUrl()
                );
            }
        } catch (Exception e) {
            log.error("Web Push Exception in test alert simulation: ", e);
        }
    }

    public List<AlertResponse> getAlertNotifications(Long userId) {
        return priceHistoryRepository.findAlertNotificationsByUserId(userId);
    }
}