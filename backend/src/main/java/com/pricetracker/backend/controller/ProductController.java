package com.pricetracker.backend.controller;

import com.pricetracker.backend.model.User;
import com.pricetracker.backend.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.pricetracker.backend.dto.TrackProductRequest;
import com.pricetracker.backend.model.Product;
import com.pricetracker.backend.service.ProductService;
import com.pricetracker.backend.model.PriceHistory;
import com.pricetracker.backend.dto.AlertResponse;
import com.pricetracker.backend.dto.TrackingHistoryResponse;
import com.pricetracker.backend.dto.AIInsightReport;
import com.pricetracker.backend.service.AIAnalysisService;

import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;
    private final UserRepository userRepository;
    private final AIAnalysisService aiAnalysisService;

    @GetMapping("/public-deals")
    public List<Map<String, Object>> getPublicDeals() {
        return productService.getPublicDeals();
    }

    @PostMapping("/track")

    public Product trackProduct(

            @RequestBody
            TrackProductRequest request,

            @AuthenticationPrincipal
            UserDetails userDetails

    ){

        User user =

                userRepository
                        .findByEmail(

                                userDetails
                                        .getUsername()

                        )

                        .orElseThrow(

                                () -> new RuntimeException(
                                        "User not found"
                                )

                        );

        return productService.trackProduct(

                request,

                user

        );

    }

    @GetMapping

    public List<Product> getProducts(

            @AuthenticationPrincipal
            UserDetails userDetails

    ){

        User user =

                userRepository
                        .findByEmail(

                                userDetails
                                        .getUsername()

                        )

                        .orElseThrow(

                                () -> new RuntimeException(
                                        "User not found"
                                )

                        );

        return productService
                .getUserProducts(
                        user.getId()
                );

    }

    @GetMapping("/history")
    public List<TrackingHistoryResponse> getTrackingHistory(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return productService.getTrackingHistory(user.getId());
    }
    @GetMapping("/{id}/history")
    public List<PriceHistory>
    getPriceHistory(

            @PathVariable
            Long id

    ){

        return
                productService
                        .getPriceHistory(
                                id
                        );

    }

    @GetMapping("/{productId}/ai-insight")
    public AIInsightReport getAIInsight(
            @PathVariable Long productId
    ) {
        return aiAnalysisService.getCachedOrGenerateReport(productId);
    }
    @DeleteMapping("/{id}")
    public void removeProduct(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        productService.removeUserTracking(user.getId(), id);
    }

    @PostMapping("/{id}/test-alert")
    public void triggerTestAlert(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        productService.triggerTestAlert(id, user);
    }

    @GetMapping("/stats")
    public Map<String, Long> getStats(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return productService.getDashboardStats(user.getId());
    }

    @GetMapping("/alerts")
    public List<AlertResponse> getAlerts(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return productService.getAlertNotifications(user.getId());
    }
}