package com.pricetracker.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "alerts")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Alert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String alertType; // SIGNIFICANT_DROP, ALL_TIME_LOW, TARGET_PRICE_REACHED, PRICE_RISING_WARNING, BACK_IN_STOCK

    @Column(nullable = false, length = 50)
    private String platform; // AMAZON, FLIPKART, MYNTRA, AJIO

    @Column(nullable = false)
    private Double dropPercent;

    @Column(nullable = false)
    private Long productId;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
