package com.pricetracker.backend.controller;

import com.pricetracker.backend.dto.TrackProductRequest;
import com.pricetracker.backend.model.Product;
import com.pricetracker.backend.service.ProductService;
import com.pricetracker.backend.model.PriceHistory;

import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ProductController {

    private final ProductService productService;

    @PostMapping("/track")
    public Product trackProduct(
            @RequestBody TrackProductRequest request
    ) {

        return productService.trackProduct(request);
    }

    @GetMapping
    public List<Product> getProducts() {

        return productService.getAllProducts();
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
}