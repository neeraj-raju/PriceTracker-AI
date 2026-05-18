package com.pricetracker.backend.controller;

import com.pricetracker.backend.dto.TrackProductRequest;
import com.pricetracker.backend.model.Product;
import com.pricetracker.backend.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @PostMapping("/track")
    public Product trackProduct(
            @RequestBody TrackProductRequest request
    ) {

        return productService.trackProduct(request);
    }
}