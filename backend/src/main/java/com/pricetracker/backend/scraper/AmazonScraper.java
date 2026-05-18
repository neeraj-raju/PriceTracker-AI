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

            log.info("Scraping Amazon URL: {}", url);

            Document doc = Jsoup.connect(url)
                    .userAgent(userAgent)
                    .header("Accept-Language", "en-US,en;q=0.9")
                    .timeout(timeout)
                    .get();

            Element titleEl = doc.selectFirst("#productTitle");
            data.put("name",
                    titleEl != null
                            ? titleEl.text().trim()
                            : "Unknown Product");

            data.put("price", extractPrice(doc));

            Element imgEl = doc.selectFirst("#landingImage");
            data.put("imageUrl",
                    imgEl != null
                            ? imgEl.attr("src")
                            : "");

            Element ratingEl = doc.selectFirst("span.a-icon-alt");
            data.put("rating",
                    ratingEl != null
                            ? ratingEl.text().split(" ")[0]
                            : "N/A");

            Element availEl = doc.selectFirst("#availability span");
            data.put("availability",
                    availEl != null
                            ? availEl.text().trim()
                            : "Unknown");

            data.put("website", "AMAZON");

            log.info("Scraped product: {}", data.get("name"));

        } catch (Exception e) {

            log.error("Error scraping Amazon product", e);

            data.put("error", "Failed to scrape product");
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