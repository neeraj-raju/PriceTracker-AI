package com.pricetracker.backend.service;

import com.pricetracker.backend.dto.TrackProductRequest;
import com.pricetracker.backend.model.Product;
import com.pricetracker.backend.repository.ProductRepository;
import com.pricetracker.backend.scraper.ScraperFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final ScraperFactory scraperFactory;

    public Product trackProduct(TrackProductRequest request) {

        Map<String, Object> scrapedData =
                scraperFactory
                        .getScraperFor(request.getUrl())
                        .scrape(request.getUrl());

        Product product = new Product();

        product.setUrl(request.getUrl());

        String productName =
                scrapedData.get("name") != null
                        ? scrapedData.get("name").toString()
                        : "Unknown Product";

        product.setName(productName);

        Object priceObj = scrapedData.get("price");

        String priceString =
                priceObj != null
                        ? priceObj.toString()
                        : "0";

        product.setCurrentPrice(
                new java.math.BigDecimal(priceString)
        );

        product.setImageUrl(
                scrapedData.get("imageUrl") != null
                        ? scrapedData.get("imageUrl").toString()
                        : ""
        );
        String website =
                scrapedData.get("website") != null
                        ? scrapedData.get("website").toString()
                        : "AMAZON";

        product.setWebsite(website);

        return productRepository.save(product);
    }
}