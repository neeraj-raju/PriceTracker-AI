package com.pricetracker.backend.service;


import com.pricetracker.backend.dto.TrackProductRequest;
import com.pricetracker.backend.model.PriceHistory;
import com.pricetracker.backend.model.Product;
import com.pricetracker.backend.repository.PriceHistoryRepository;
import com.pricetracker.backend.repository.ProductRepository;
import com.pricetracker.backend.scraper.ScraperFactory;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    private final PriceHistoryRepository
            priceHistoryRepository;

    private final ScraperFactory scraperFactory;

    public Product trackProduct(
            TrackProductRequest request
    ) {
        if(productRepository.existsByUrl(
                request.getUrl()
        )) {

            throw new RuntimeException(
                    "Already tracking this product"
            );

        }

        Map<String, Object> scrapedData =
                scraperFactory
                        .getScraperFor(
                                request.getUrl()
                        )
                        .scrape(
                                request.getUrl()
                        );

        Product product = new Product();

        product.setUrl(
                request.getUrl()
        );

        String productName =

                scrapedData.get("name") != null

                        ?

                        scrapedData.get("name")
                                .toString()

                        :

                        "Unknown Product";

        product.setName(
                productName
        );

        Object priceObj =
                scrapedData.get("price");

        String priceString =

                priceObj != null

                        ?

                        priceObj.toString()

                        :

                        "0";

        product.setCurrentPrice(

                new BigDecimal(
                        priceString
                )

        );

        product.setImageUrl(

                scrapedData.get("imageUrl")
                        != null

                        ?

                        scrapedData
                                .get("imageUrl")
                                .toString()

                        :

                        ""

        );

        String website =

                scrapedData.get("website")
                        != null

                        ?

                        scrapedData
                                .get("website")
                                .toString()

                        :

                        "AMAZON";

        product.setWebsite(
                website
        );

        Product savedProduct =

                productRepository
                        .save(product);

        PriceHistory history =
                new PriceHistory();

        history.setProduct(
                savedProduct
        );

        history.setOldPrice(
                savedProduct
                        .getCurrentPrice()
        );

        history.setNewPrice(
                savedProduct
                        .getCurrentPrice()
        );

        history.setPriceDropped(
                false
        );

        priceHistoryRepository
                .save(history);

        return savedProduct;

    }

    public List<Product> getAllProducts() {

        return productRepository.findAll();

    }
    public void removeProduct(
            Long productId
    ) {

        productRepository
                .deleteById(
                        productId
                );

    }
    public List<PriceHistory> getPriceHistory(
            Long productId
    ) {

        return
                priceHistoryRepository
                        .findByProductIdOrderByCheckedAtAsc(
                                productId
                        );

    }

}