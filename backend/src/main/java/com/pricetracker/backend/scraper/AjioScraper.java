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
public class AjioScraper implements ScraperStrategy {

    @Value("${app.scraper.user-agent}")
    private String userAgent;

    @Value("${app.scraper.timeout}")
    private int timeout;

    @Override
    public boolean supports(String url) {
        return url != null && url.contains("ajio.com");
    }

    @Override
    public Map<String, Object> scrape(String url) {
        Map<String, Object> data = new HashMap<>();

        try {
            log.info("Scraping Ajio URL: {}", url);

            Document doc = fetchWithCurlFallback(url);

            // 1. Extract Product Name
            String productName = "Unknown Ajio Product";
            Element brandEl = doc.selectFirst(".brand-name");
            Element nameEl = doc.selectFirst(".prod-name");
            
            if (brandEl != null && nameEl != null) {
                productName = brandEl.text().trim() + " - " + nameEl.text().trim();
            } else if (nameEl != null) {
                productName = nameEl.text().trim();
            } else {
                Element h1El = doc.selectFirst("h1");
                if (h1El != null) productName = h1El.text().trim();
            }
            data.put("name", productName);

            // 2. Extract Price
            String price = extractPrice(doc);
            data.put("price", price);

            // 3. Extract Image URL
            String imageUrl = "";
            Element imgEl = doc.selectFirst("img.rilImage-responsive");
            if (imgEl == null) imgEl = doc.selectFirst(".img-container img");
            if (imgEl == null) imgEl = doc.selectFirst(".prod-image-zoom img");
            if (imgEl != null) {
                imageUrl = imgEl.attr("src");
            }
            data.put("imageUrl", imageUrl);

            // 4. Extract Rating
            String rating = "N/A";
            Element ratingEl = doc.selectFirst(".prod-rating-percentage");
            if (ratingEl == null) ratingEl = doc.selectFirst(".rating-stars");
            if (ratingEl != null) rating = ratingEl.text().trim();
            data.put("rating", rating);

            // 5. Extract Availability
            String availability = "In Stock";
            boolean isOutOfStock = doc.text().contains("Out of Stock")
                    || doc.text().contains("Sold Out")
                    || doc.selectFirst(".out-of-stock") != null
                    || doc.selectFirst(".size-instock") == null && doc.selectFirst(".size-swatch") != null; // Swatches are present but none in stock
            if (isOutOfStock) {
                availability = "Out of Stock";
            }
            data.put("availability", availability);

            data.put("website", "AJIO");
            log.info("Ajio Scraped Data: {}", data);

        } catch (Exception e) {
            log.warn("Ajio scraping failed, using fallback: {}", e.getMessage());
            return ScraperFallbackUtil.getFallbackScrapedData(url);
        }

        String nameStr = data.get("name") != null ? data.get("name").toString() : "";
        if (nameStr.isEmpty() || nameStr.toLowerCase().contains("unknown") || "0".equals(data.get("price").toString())) {
            log.info("Ajio scrape returned incomplete data. Using fallback for: {}", url);
            return ScraperFallbackUtil.getFallbackScrapedData(url);
        }

        return data;
    }

    private String extractPrice(Document doc) {
        Element priceEl = doc.selectFirst(".prod-sp"); // Special Price class in Ajio
        if (priceEl == null) priceEl = doc.selectFirst("div.prod-sp");
        if (priceEl == null) priceEl = doc.selectFirst(".prod-price-section");
        
        if (priceEl != null) {
            return clean(priceEl.text());
        }
        return "0";
    }

    private String clean(String price) {
        if (price == null) {
            return "0";
        }
        price = price
                .replace("Rs.", "")
                .replace("₹", "")
                .replace(",", "")
                .trim();

        price = price.replaceAll("[^0-9.]", "");

        if (price.isEmpty()) {
            return "0";
        }
        return price;
    }

    private Document fetchWithCurlFallback(String url) throws Exception {
        try {
            return Jsoup.connect(url)
                    .userAgent(userAgent)
                    .header("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8")
                    .header("Accept-Language", "en-US,en;q=0.9")
                    .header("Connection", "keep-alive")
                    .header("Upgrade-Insecure-Requests", "1")
                    .timeout(timeout)
                    .get();
        } catch (org.jsoup.HttpStatusException ex) {
            if (ex.getStatusCode() == 403 || ex.getStatusCode() == 503) {
                log.info("Received HTTP {} from Jsoup. Attempting curl fallback for URL: {}", ex.getStatusCode(), url);
                try {
                    ProcessBuilder pb = new ProcessBuilder(
                        "curl.exe",
                        "-s",
                        "-L",
                        "-A", userAgent,
                        "-H", "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
                        "-H", "Accept-Language: en-US,en;q=0.9",
                        url
                    );
                    Process process = pb.start();
                    java.io.ByteArrayOutputStream outputStream = new java.io.ByteArrayOutputStream();
                    try (java.io.InputStream inputStream = process.getInputStream()) {
                        byte[] buffer = new byte[4096];
                        int bytesRead;
                        while ((bytesRead = inputStream.read(buffer)) != -1) {
                            outputStream.write(buffer, 0, bytesRead);
                        }
                    }
                    int exitCode = process.waitFor();
                    if (exitCode == 0) {
                        String html = outputStream.toString("UTF-8");
                        if (html != null && !html.trim().isEmpty()) {
                            return Jsoup.parse(html, url);
                        }
                    } else {
                        log.warn("Curl fallback failed with exit code: {}", exitCode);
                    }
                } catch (Exception curlEx) {
                    log.error("Failed to execute curl fallback: {}", curlEx.getMessage(), curlEx);
                }
            }
            throw ex;
        }
    }
}
