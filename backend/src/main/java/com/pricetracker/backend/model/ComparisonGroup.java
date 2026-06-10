package com.pricetracker.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "comparison_group")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComparisonGroup {

    @Id
    @Column(name = "id", length = 36)
    private String id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String groupName;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "comparisonGroup", fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    private List<UserTracking> trackedProducts;
}
