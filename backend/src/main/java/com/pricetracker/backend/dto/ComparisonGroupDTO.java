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
public class ComparisonGroupDTO {
    private String id;
    private String groupName;
    private Long userId;
    private LocalDateTime createdAt;
    private Integer productCount;
}
