package com.pricetracker.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlatformStatDTO {
    private String platform;
    private String displayName;
    private String colorHex;
    private Long totalTracked;
    private Long dropsThisWeek;
    private Double averageSaving;
    private String trend;
}
