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
public class AlertResponse {
    private Long id;
    private Long productId;
    private String productName;
    private String imageUrl;
    private String website;
    private String productUrl;
    private BigDecimal oldPrice;
    private BigDecimal newPrice;
    private LocalDateTime checkedAt;
    private String alertPreference;
}
