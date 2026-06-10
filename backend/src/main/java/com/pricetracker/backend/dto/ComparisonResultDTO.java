package com.pricetracker.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComparisonResultDTO {
    private String groupId;
    private String groupName;
    private List<ComparisonItem> items;
    private String bestDealPlatform;
    private BigDecimal totalSavingsVsBest;
    private LocalDateTime lastUpdatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ComparisonItem {
        private Long productId;
        private String productName;
        private String platform;
        private BigDecimal currentPrice;
        private BigDecimal lowestEverPrice;
        private BigDecimal originalPrice;
        private Double discountPercent;
        private String rating;
        private String availability;
        private String productUrl;
        private String imageUrl;
        private Boolean isBestDeal;
    }
}
