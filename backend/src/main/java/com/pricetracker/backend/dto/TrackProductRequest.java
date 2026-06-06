package com.pricetracker.backend.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class TrackProductRequest {

    private String url;
    private BigDecimal targetPrice;
    private String alertPreference;
}