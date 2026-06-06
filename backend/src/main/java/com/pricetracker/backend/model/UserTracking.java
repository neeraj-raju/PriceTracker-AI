package com.pricetracker.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_tracking",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "product_id"}))
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserTracking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(precision = 10, scale = 2)
    private BigDecimal targetPrice;

    @Column(nullable = false)
    @Builder.Default
    private Boolean alertEnabled = true;

    @Column(length = 20, nullable = false)
    @Builder.Default
    private String alertPreference = "EMAIL";

    private String note;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime trackedSince;
}