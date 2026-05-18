package com.pricetracker.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class ProductRequest {
    @NotBlank(message = "Product URL is required")
    private String url;
    private BigDecimal targetPrice;
    private String note;
}