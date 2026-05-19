package com.pricetracker.backend.scraper;

import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
@Slf4j
public class AmazonScraper implements ScraperStrategy {

    @Value("${app.scraper.user-agent}")
    private String userAgent;

    @Value("${app.scraper.timeout}")
    private int timeout;

    @Override
    public boolean supports(String url) {
        return url != null &&
                (url.contains("amazon.in") || url.contains("amazon.com"));
    }

    @Override
    public Map<String, Object> scrape(String url) {

        Map<String, Object> data = new HashMap<>();

        try {

            System.out.println("Scraping URL: " + url);

            Document doc = Jsoup.connect(url)
                    .userAgent(userAgent)
                    .header("Accept-Language", "en-US,en;q=0.9")
                    .header("Accept-Encoding", "gzip, deflate")
                    .header("Connection", "keep-alive")
                    .timeout(timeout)
                    .get();

            // PRODUCT NAME
            Element titleEl = doc.selectFirst("#productTitle");

            String productName =
                    titleEl != null
                            ? titleEl.text().trim()
                            : "Unknown Product";

            data.put("name", productName);

            // PRODUCT PRICE
            String price = extractPrice(doc);

            data.put("price", price);

            // PRODUCT IMAGE
            Element imgEl = doc.selectFirst("#landingImage");

            data.put(
                    "imageUrl",
                    imgEl != null
                            ? imgEl.attr("src")
                            : ""
            );

            // RATING
            Element ratingEl = doc.selectFirst("span.a-icon-alt");

            data.put(
                    "rating",
                    ratingEl != null
                            ? ratingEl.text()
                            : "N/A"
            );

            // AVAILABILITY
            Element availEl =
                    doc.selectFirst("#availability span");

            data.put(
                    "availability",
                    availEl != null
                            ? availEl.text().trim()
                            : "Unknown"
            );

            // WEBSITE
            data.put("website", "AMAZON");

            System.out.println("SCRAPED DATA: " + data);

        } catch (Exception e) {

            e.printStackTrace();

            data.put("name", "Unknown Product");
            data.put("price", "0");
            data.put("website", "AMAZON");
            data.put("imageUrl", "");
            data.put("rating", "N/A");
            data.put("availability", "Unknown");
        }

        return data;
    }

    private String extractPrice(Document doc) {

        Element el = doc.selectFirst(".a-price .a-offscreen");

        if (el != null) {
            return clean(el.text());
        }

        el = doc.selectFirst("#priceblock_ourprice");

        if (el != null) {
            return clean(el.text());
        }

        el = doc.selectFirst("#priceblock_dealprice");

        if (el != null) {
            return clean(el.text());
        }

        el = doc.selectFirst("span.a-price-whole");

        if (el != null) {
            return clean(el.text());
        }

        return "0";
    }

    private String clean(String price) {
        return price.replaceAll("[^0-9.]", "");
    }
}