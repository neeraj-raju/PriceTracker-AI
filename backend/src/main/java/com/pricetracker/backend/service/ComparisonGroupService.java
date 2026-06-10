package com.pricetracker.backend.service;

import com.pricetracker.backend.dto.ComparisonGroupDTO;
import com.pricetracker.backend.dto.ComparisonResultDTO;
import com.pricetracker.backend.dto.TrackProductRequest;
import com.pricetracker.backend.model.*;
import com.pricetracker.backend.repository.*;
import com.pricetracker.backend.scraper.ScraperFactory;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ComparisonGroupService {

    private final ComparisonGroupRepository comparisonGroupRepository;
    private final UserTrackingRepository userTrackingRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final PriceHistoryRepository priceHistoryRepository;
    private final ProductService productService;
    private final ScraperFactory scraperFactory;

    private String detectPlatform(String url) {
        if (url == null) return null;
        String lower = url.toLowerCase();
        if (lower.contains("amazon.in") || lower.contains("amazon.com") || lower.contains("amzn.in") || lower.contains("amzn.to")) {
            return "AMAZON";
        }
        if (lower.contains("flipkart.com")) {
            return "FLIPKART";
        }
        if (lower.contains("myntra.com")) {
            return "MYNTRA";
        }
        if (lower.contains("ajio.com")) {
            return "AJIO";
        }
        return null;
    }

    @Transactional
    public ComparisonGroupDTO createGroup(Long userId, String groupName, List<String> productUrls) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (productUrls == null || productUrls.size() < 2 || productUrls.size() > 4) {
            throw new IllegalArgumentException("Comparison group must have between 2 and 4 product URLs.");
        }

        Set<String> platforms = new HashSet<>();
        for (String url : productUrls) {
            String platform = detectPlatform(url);
            if (platform == null) {
                throw new IllegalArgumentException("Unsupported or invalid e-commerce platform URL: " + url);
            }
            if (!platforms.add(platform)) {
                throw new IllegalArgumentException("Products must be from different platforms. Duplicate found: " + platform);
            }
        }

        String groupId = UUID.randomUUID().toString();
        ComparisonGroup group = ComparisonGroup.builder()
                .id(groupId)
                .userId(userId)
                .groupName(groupName)
                .trackedProducts(new ArrayList<>())
                .build();

        group = comparisonGroupRepository.save(group);

        List<UserTracking> trackings = new ArrayList<>();
        for (String url : productUrls) {
            TrackProductRequest trackReq = new TrackProductRequest();
            trackReq.setUrl(url);
            trackReq.setTargetPrice(null);
            trackReq.setAlertPreference("EMAIL");

            Optional<Product> alreadyTracked = productRepository.findTrackedProduct(userId, url);
            UserTracking ut;

            if (alreadyTracked.isPresent()) {
                Product product = alreadyTracked.get();
                ut = userTrackingRepository.findByUserIdAndProductId(userId, product.getId())
                        .orElseThrow(() -> new RuntimeException("Tracking record not found"));
            } else {
                Product product = productService.trackProduct(trackReq, user);
                ut = userTrackingRepository.findByUserIdAndProductId(userId, product.getId())
                        .orElseThrow(() -> new RuntimeException("Tracking record not found"));
            }

            ut.setComparisonGroup(group);
            userTrackingRepository.save(ut);
            trackings.add(ut);
        }

        group.setTrackedProducts(trackings);
        comparisonGroupRepository.save(group);

        return ComparisonGroupDTO.builder()
                .id(group.getId())
                .groupName(group.getGroupName())
                .userId(userId)
                .createdAt(group.getCreatedAt() != null ? group.getCreatedAt() : LocalDateTime.now())
                .productCount(trackings.size())
                .build();
    }

    public List<ComparisonGroupDTO> getGroups(Long userId) {
        List<ComparisonGroup> groups = comparisonGroupRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return groups.stream()
                .map(g -> ComparisonGroupDTO.builder()
                        .id(g.getId())
                        .groupName(g.getGroupName())
                        .userId(userId)
                        .createdAt(g.getCreatedAt())
                        .productCount(g.getTrackedProducts() != null ? g.getTrackedProducts().size() : 0)
                        .build())
                .collect(Collectors.toList());
    }

    public ComparisonResultDTO getGroupComparison(String groupId, Long userId) {
        ComparisonGroup group = comparisonGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Comparison group not found"));
        if (!group.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to this comparison group.");
        }

        List<ComparisonResultDTO.ComparisonItem> items = new ArrayList<>();
        BigDecimal lowestPrice = null;
        BigDecimal highestPrice = null;
        String bestDealPlatform = "N/A";

        for (UserTracking ut : group.getTrackedProducts()) {
            Product p = ut.getProduct();
            BigDecimal currentPrice = p.getCurrentPrice();

            BigDecimal lowestEver = priceHistoryRepository.findLowestPriceByProductId(p.getId()).orElse(currentPrice);
            BigDecimal highestEver = priceHistoryRepository.findHighestPriceByProductId(p.getId()).orElse(currentPrice);
            BigDecimal originalPrice = highestEver.compareTo(currentPrice) > 0 ? highestEver : currentPrice;

            double discountPercent = 0.0;
            if (originalPrice.compareTo(BigDecimal.ZERO) > 0) {
                discountPercent = ((originalPrice.subtract(currentPrice)).doubleValue() / originalPrice.doubleValue()) * 100.0;
            }

            ComparisonResultDTO.ComparisonItem item = ComparisonResultDTO.ComparisonItem.builder()
                    .productId(p.getId())
                    .productName(p.getName())
                    .platform(p.getWebsite())
                    .currentPrice(currentPrice)
                    .lowestEverPrice(lowestEver)
                    .originalPrice(originalPrice)
                    .discountPercent(discountPercent)
                    .rating(p.getRating())
                    .availability(p.getAvailability())
                    .productUrl(p.getUrl())
                    .imageUrl(p.getImageUrl())
                    .isBestDeal(false)
                    .build();

            items.add(item);

            if (lowestPrice == null || currentPrice.compareTo(lowestPrice) < 0) {
                lowestPrice = currentPrice;
                bestDealPlatform = p.getWebsite();
            }
            if (highestPrice == null || currentPrice.compareTo(highestPrice) > 0) {
                highestPrice = currentPrice;
            }
        }

        // Set best deal flags
        for (ComparisonResultDTO.ComparisonItem item : items) {
            if (lowestPrice != null && item.getCurrentPrice().compareTo(lowestPrice) == 0) {
                item.setIsBestDeal(true);
            }
        }

        BigDecimal totalSavings = BigDecimal.ZERO;
        if (highestPrice != null && lowestPrice != null) {
            totalSavings = highestPrice.subtract(lowestPrice);
        }

        return ComparisonResultDTO.builder()
                .groupId(groupId)
                .groupName(group.getGroupName())
                .items(items)
                .bestDealPlatform(bestDealPlatform)
                .totalSavingsVsBest(totalSavings)
                .lastUpdatedAt(LocalDateTime.now())
                .build();
    }

    @Transactional
    public ComparisonResultDTO refreshGroupPrices(String groupId, Long userId) {
        ComparisonGroup group = comparisonGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Comparison group not found"));
        if (!group.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to this comparison group.");
        }

        for (UserTracking ut : group.getTrackedProducts()) {
            Product product = ut.getProduct();
            try {
                Map<String, Object> scrapedData = scraperFactory.getScraperFor(product.getUrl()).scrape(product.getUrl());
                BigDecimal oldPrice = product.getCurrentPrice();
                String priceStr = scrapedData.get("price") != null ? scrapedData.get("price").toString() : "0";
                BigDecimal newPrice = new BigDecimal(priceStr);

                if (newPrice.compareTo(BigDecimal.ZERO) > 0) {
                    product.setCurrentPrice(newPrice);
                    if (scrapedData.get("name") != null) product.setName(scrapedData.get("name").toString());
                    if (scrapedData.get("imageUrl") != null) product.setImageUrl(scrapedData.get("imageUrl").toString());
                    if (scrapedData.get("rating") != null) product.setRating(scrapedData.get("rating").toString());
                    if (scrapedData.get("availability") != null) product.setAvailability(scrapedData.get("availability").toString());
                    productRepository.save(product);

                    if (oldPrice.compareTo(newPrice) != 0) {
                        PriceHistory history = PriceHistory.builder()
                                .product(product)
                                .oldPrice(oldPrice)
                                .newPrice(newPrice)
                                .priceDropped(newPrice.compareTo(oldPrice) < 0)
                                .build();
                        priceHistoryRepository.save(history);
                    }
                }
            } catch (Exception e) {
                log.warn("Failed to refresh price for comparison product: {}", product.getUrl(), e);
            }
        }

        return getGroupComparison(groupId, userId);
    }

    @Transactional
    public void deleteGroup(String groupId, Long userId) {
        ComparisonGroup group = comparisonGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Comparison group not found"));
        if (!group.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized to delete this comparison group.");
        }

        for (UserTracking ut : group.getTrackedProducts()) {
            ut.setComparisonGroup(null);
            userTrackingRepository.save(ut);
        }

        comparisonGroupRepository.delete(group);
    }
}
