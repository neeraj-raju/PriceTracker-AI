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
public class TrackingHistoryResponse {
    private Long trackingId;
    private Long productId;
    private String productName;
    private String productUrl;
    private String imageUrl;
    private String website;
    private BigDecimal initialPrice;
    private BigDecimal currentPrice;
    private BigDecimal targetPrice;
    private LocalDateTime trackedSince;
    private String status;
}
