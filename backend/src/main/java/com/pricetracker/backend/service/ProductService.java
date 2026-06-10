package com.pricetracker.backend.service;


import com.pricetracker.backend.dto.AlertResponse;
import com.pricetracker.backend.dto.TrackProductRequest;
import com.pricetracker.backend.dto.TrackingHistoryResponse;
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
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.HashMap;
import java.util.stream.Collectors;

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
            Optional<UserTracking> existingTracking = userTrackingRepository.findByUserIdAndProductId(user.getId(), product.getId());
            if (existingTracking.isPresent()) {
                UserTracking tracking = existingTracking.get();
                if ("ACTIVE".equalsIgnoreCase(tracking.getStatus())) {
                    throw new RuntimeException("Already tracking this product");
                } else {
                    // Reactivate it!
                    tracking.setStatus("ACTIVE");
                    tracking.setTargetPrice(request.getTargetPrice() != null ? request.getTargetPrice() : product.getCurrentPrice());
                    if (request.getAlertPreference() != null) {
                        tracking.setAlertPreference(request.getAlertPreference());
                    } else {
                        tracking.setAlertPreference("EMAIL");
                    }
                    tracking.setInitialPrice(product.getCurrentPrice());
                    tracking.setTrackedSince(LocalDateTime.now());
                    userTrackingRepository.save(tracking);
                    return product;
                }
            }
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
        tracking.setTargetPrice(request.getTargetPrice() != null ? request.getTargetPrice() : product.getCurrentPrice());
        if (request.getAlertPreference() != null) {
            tracking.setAlertPreference(request.getAlertPreference());
        } else {
            tracking.setAlertPreference("EMAIL");
        }
        tracking.setStatus("ACTIVE");
        tracking.setInitialPrice(product.getCurrentPrice());

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
        Optional<UserTracking> trackingOpt = userTrackingRepository.findByUserIdAndProductId(userId, productId);
        if (trackingOpt.isPresent()) {
            UserTracking tracking = trackingOpt.get();
            tracking.setStatus("REMOVED");
            userTrackingRepository.save(tracking);
        }
    }

    public List<TrackingHistoryResponse> getTrackingHistory(Long userId) {
        List<UserTracking> trackings = userTrackingRepository.findByUserId(userId);
        return trackings.stream()
                .map(ut -> {
                    Product p = ut.getProduct();
                    return TrackingHistoryResponse.builder()
                            .trackingId(ut.getId())
                            .productId(p.getId())
                            .productName(p.getName())
                            .productUrl(p.getUrl())
                            .imageUrl(p.getImageUrl())
                            .website(p.getWebsite())
                            .initialPrice(ut.getInitialPrice())
                            .currentPrice(p.getCurrentPrice())
                            .targetPrice(ut.getTargetPrice())
                            .trackedSince(ut.getTrackedSince())
                            .status(ut.getStatus())
                            .build();
                })
                .collect(Collectors.toList());
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

        long trackedProductsCount = userTrackingRepository.countActiveByUserId(userId);
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

    public List<Map<String, Object>> getPublicDeals() {
        long timeSec = System.currentTimeMillis() / 10000; // changes every 10 seconds
        List<Map<String, Object>> deals = new java.util.ArrayList<>();
        
        deals.add(createDeal(1L, "Apple iPhone 15 Pro Max (256 GB, Natural Titanium)", 
            "https://www.amazon.in/dp/B0CHX1W1YW", "AMAZON", 
            "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?q=80&w=400", 
            159900, 134900, 2500, timeSec, 0));
            
        deals.add(createDeal(2L, "Sony WH-1000XM5 Wireless ANC Headphones", 
            "https://www.amazon.in/dp/B09XS7JWHH", "AMAZON", 
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=400", 
            34990, 26900, 800, timeSec, 1));
            
        deals.add(createDeal(3L, "Nike Air Zoom Pegasus 40 Men's Running Shoes", 
            "https://www.myntra.com/shoes/nike/nike-men-air-zoom-pegasus-40-running-shoes/22729262/buy", "MYNTRA", 
            "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=400", 
            11995, 9595, 300, timeSec, 2));
            
        deals.add(createDeal(4L, "Puma Palermo Leather Unisex Sneakers", 
            "https://www.ajio.com/puma-men-palermo-leather-sneakers/p/467083656_blue", "AJIO", 
            "https://images.unsplash.com/photo-1539185441755-769473a23570?q=80&w=400", 
            7999, 5199, 200, timeSec, 3));
            
        deals.add(createDeal(5L, "Samsung Galaxy S24 Ultra (5G, Titanium Gray, 256 GB)", 
            "https://www.flipkart.com/samsung-galaxy-s24-ultra-5g-titanium-gray-256-gb/p/itm2b49bc52ba3d1", "FLIPKART", 
            "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=400", 
            139999, 119999, 3000, timeSec, 4));
            
        deals.add(createDeal(6L, "Apple iPad Air 11-inch (M2, Wi-Fi, 128 GB)", 
            "https://www.flipkart.com/apple-ipad-air-6th-gen-128-gb-rom-11-inch-wi-fi-space-grey/p/itm1df5020163351", "FLIPKART", 
            "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=400", 
            59900, 54900, 1000, timeSec, 5));
            
        deals.add(createDeal(7L, "ASUS ROG Ally Ryzen Z1 Extreme Handheld", 
            "https://www.flipkart.com/asus-rog-ally-ryzen-z1-extreme-16-gb-512-gb-ssd-windows-11-home-gaming-handheld/p/itm4b23ce8d8d348", "FLIPKART", 
            "https://images.unsplash.com/photo-1605901309584-818e25960a8f?q=80&w=400", 
            69990, 49990, 1500, timeSec, 6));
            
        deals.add(createDeal(8L, "Noise ColorFit Pro 5 Smart Watch (Amoled, Bluetooth)", 
            "https://www.amazon.in/dp/B0CHYMCGD4", "AMAZON", 
            "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400", 
            8999, 3999, 250, timeSec, 7));
            
        return deals;
    }
    
    private Map<String, Object> createDeal(
            Long id,
            String name,
            String url,
            String website,
            String imageUrl,
            double originalPrice,
            double basePrice,
            double amplitude,
            long timeSec,
            int index
    ) {
        Map<String, Object> deal = new HashMap<>();
        deal.put("id", id);
        deal.put("name", name);
        deal.put("url", url);
        deal.put("website", website);
        deal.put("imageUrl", imageUrl);
        deal.put("originalPrice", originalPrice);
        
        double sine = Math.sin((timeSec + index * 17) * 0.25);
        double currentPrice = basePrice + amplitude * sine;
        currentPrice = Math.round(currentPrice);
        deal.put("currentPrice", currentPrice);
        
        double discount = ((originalPrice - currentPrice) / originalPrice) * 100;
        deal.put("discountPercent", Math.round(discount));
        
        deal.put("rating", Math.round((4.2 + (index % 7) * 0.1) * 10.0) / 10.0);
        deal.put("reviewsCount", 850 + index * 420);
        
        return deal;
    }
}