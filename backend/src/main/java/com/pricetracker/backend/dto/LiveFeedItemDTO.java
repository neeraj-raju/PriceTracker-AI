package com.pricetracker.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LiveFeedItemDTO {
    private String alertType;
    private String message;
    private String platform;
    private String colorHex;
    private String icon;
    private String timeAgo;
    private LocalDateTime createdAt;
}
