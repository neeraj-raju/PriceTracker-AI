package com.pricetracker.backend.scheduler;

import com.pricetracker.backend.model.PriceHistory;
import com.pricetracker.backend.model.Product;
import com.pricetracker.backend.repository.PriceHistoryRepository;
import com.pricetracker.backend.repository.ProductRepository;
import com.pricetracker.backend.scraper.ScraperFactory;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import com.pricetracker.backend.service.EmailService;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class PriceTrackerScheduler {

    private final ProductRepository productRepository;
    private final PriceHistoryRepository priceHistoryRepository;
    private final ScraperFactory scraperFactory;
    private final EmailService emailService;

    @Scheduled(fixedRate = 300000)
    public void checkPrices() {

        log.info("Scheduler running: Checking product prices...");

        List<Product> products = productRepository.findAll();

        for (Product product : products) {

            try {

                Map<String, Object> scrapedData =
                        scraperFactory
                                .getScraperFor(product.getUrl())
                                .scrape(product.getUrl());

                Object priceObj = scrapedData.get("price");

                if (priceObj == null) {
                    continue;
                }

                BigDecimal newPrice =
                        new BigDecimal(priceObj.toString());

                BigDecimal oldPrice =
                        product.getCurrentPrice();

                boolean priceDropped =
                        newPrice.compareTo(oldPrice) < 0;
                if (priceDropped) {

                    product.getUserTrackingList()
                            .forEach(
                                    tracking ->

                                            emailService.sendPriceDropEmail(

                                                    tracking
                                                            .getUser()
                                                            .getEmail(),

                                                    product.getName(),

                                                    oldPrice.toString(),

                                                    newPrice.toString()

                                            )
                            );

                    log.info(
                            "Price drop email sent for product: {}",
                            product.getName()
                    );
                }

                product.setCurrentPrice(newPrice);

                productRepository.save(product);

                PriceHistory history = new PriceHistory();

                history.setProduct(product);
                history.setOldPrice(oldPrice);
                history.setNewPrice(newPrice);
                history.setPriceDropped(priceDropped);

                priceHistoryRepository.save(history);

                log.info(
                        "Updated product: {} | Old Price: {} | New Price: {}",
                        product.getName(),
                        oldPrice,
                        newPrice
                );

            } catch (Exception e) {

                log.error(
                        "Error checking product: {}",
                        product.getUrl(),
                        e
                );
            }
        }
    }
}