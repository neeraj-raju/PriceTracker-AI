package com.pricetracker.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AIInsightReport {
    private Long productId;
    private String productName;
    private BigDecimal currentPrice;
    private BigDecimal lowestPrice;
    private BigDecimal highestPrice;
    private BigDecimal averagePrice;
    private Double priceVolatility;
    private Long daysTracked;
    private Integer totalDropCount;
    private Integer totalRiseCount;
    private AIRecommendation recommendation;
    private String insightText;
    private String cheapestDayOfWeek;
    private String recentTrend;
    private String linearTrend;
    private LocalDateTime generatedAt;
    private AIInsightStatus status;
}
