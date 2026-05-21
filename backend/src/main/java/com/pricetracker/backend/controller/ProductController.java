package com.pricetracker.backend.controller;

import com.pricetracker.backend.model.User;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.pricetracker.backend.dto.TrackProductRequest;
import com.pricetracker.backend.model.Product;
import com.pricetracker.backend.service.ProductService;
import com.pricetracker.backend.model.PriceHistory;

import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ProductController {

    private final ProductService productService;

    @PostMapping("/track")
    public Product trackProduct(

            @RequestBody
            TrackProductRequest request,

            @AuthenticationPrincipal
            User user

    ){

        return productService.trackProduct(

                request,

                user

        );

    }

    @GetMapping
    public List<Product> getProducts(

            @AuthenticationPrincipal
            User user

    ){

        return
                productService
                        .getUserProducts(

                                user.getId()

                        );

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
    @DeleteMapping("/{id}")
    public void removeProduct(
            @PathVariable
            Long id
    ) {

        productService
                .removeProduct(id);

    }
    @GetMapping("/stats")
    public Map<String, Long>
    getStats(){

        return
                productService
                        .getDashboardStats();

    }
}