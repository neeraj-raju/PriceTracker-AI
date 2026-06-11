package com.pricetracker.backend.scraper;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.util.HashMap;
import java.util.Map;

@Component
@Slf4j
public class MyntraScraper implements ScraperStrategy {

    @Value("${app.scraper.user-agent}")
    private String userAgent;

    @Value("${app.scraper.timeout}")
    private int timeout;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public boolean supports(String url) {
        return url != null && url.contains("myntra.com");
    }

    @Override
    public Map<String, Object> scrape(String url) {
        Map<String, Object> data = new HashMap<>();

        try {
            log.info("Scraping Myntra URL: {}", url);

            Document doc = null;
            try {
                doc = Jsoup.connect(url)
                        .userAgent(userAgent)
                        .header("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8")
                        .header("Accept-Language", "en-US,en;q=0.9")
                        .timeout(timeout)
                        .get();
            } catch (Exception e) {
                log.info("Jsoup connect failed for Myntra, trying curl fallback: {}", e.getMessage());
            }

            if (doc != null) {
                data = parseMyntraDoc(doc);
            }

            // If Jsoup parsing failed or returned invalid data, try curl fallback
            String nameStr = data.get("name") != null ? data.get("name").toString() : "";
            if (nameStr.isEmpty() || nameStr.toLowerCase().contains("unknown") || "0".equals(data.get("price").toString())) {
                log.info("Jsoup scrape returned invalid data, attempting curl fetch for Myntra: {}", url);
                doc = fetchWithCurl(url);
                if (doc != null) {
                    data = parseMyntraDoc(doc);
                }
            }

        } catch (Exception e) {
            log.warn("Myntra scraping failed: {}", e.getMessage());
        }

        String nameStr = data.get("name") != null ? data.get("name").toString() : "";
        if (nameStr.isEmpty() || nameStr.toLowerCase().contains("unknown") || "0".equals(data.get("price").toString())) {
            log.info("Myntra scrape returned incomplete data. Using fallback for: {}", url);
            return ScraperFallbackUtil.getFallbackScrapedData(url);
        }

        return data;
    }

    private Map<String, Object> parseMyntraDoc(Document doc) {
        Map<String, Object> data = new HashMap<>();
        boolean parsedJson = false;
        Elements scripts = doc.getElementsByTag("script");
        for (Element script : scripts) {
            String htmlContent = script.html();
            if (htmlContent.contains("window.__myx") || htmlContent.contains("window.pdpData") || htmlContent.contains("pdpData")) {
                try {
                    int startIndex = htmlContent.indexOf("{");
                    int endIndex = htmlContent.lastIndexOf("}");
                    if (startIndex != -1 && endIndex != -1 && endIndex > startIndex) {
                        String jsonStr = htmlContent.substring(startIndex, endIndex + 1);
                        JsonNode jsonNode = objectMapper.readTree(jsonStr);

                        if (jsonNode.has("pdpData")) {
                            jsonNode = jsonNode.get("pdpData");
                        }

                        // Extract Name
                        String brand = jsonNode.path("analytics").path("brand").asText("Unknown Brand");
                        String name = jsonNode.path("name").asText("Unknown Product");
                        data.put("name", brand + " - " + name);

                        // Extract Price
                        double discountedPrice = jsonNode.path("price").path("discounted").asDouble(0.0);
                        if (discountedPrice == 0.0) {
                            discountedPrice = jsonNode.path("price").path("mrp").asDouble(0.0);
                        }
                        data.put("price", String.valueOf(discountedPrice));

                        // Extract Image URL
                        String imageUrl = "";
                        JsonNode mediaNode = jsonNode.path("media").path("albums");
                        if (mediaNode.isArray() && mediaNode.size() > 0) {
                            JsonNode imagesNode = mediaNode.get(0).path("images");
                            if (imagesNode.isArray() && imagesNode.size() > 0) {
                                imageUrl = imagesNode.get(0).path("src").asText("");
                            }
                        }
                        data.put("imageUrl", imageUrl);

                        // Extract Rating
                        double ratingVal = jsonNode.path("ratings").path("averageRating").asDouble(0.0);
                        data.put("rating", ratingVal > 0 ? String.format("%.1f", ratingVal) : "N/A");

                        // Extract Availability
                        boolean inStock = jsonNode.path("inStock").asBoolean(true);
                        data.put("availability", inStock ? "In Stock" : "Out of Stock");

                        data.put("website", "MYNTRA");
                        parsedJson = true;
                        break;
                    }
                } catch (Exception jsonEx) {
                    log.warn("Failed to parse Myntra JSON block: {}", jsonEx.getMessage());
                }
            }
        }

        // Fallback to HTML CSS Selectors if JSON parsing fails
        if (!parsedJson) {
            // 1. Extract Name
            String name = "Unknown Myntra Product";
            Element titleEl = doc.selectFirst(".pdp-title");
            Element nameEl = doc.selectFirst(".pdp-name");
            if (titleEl != null && nameEl != null) {
                name = titleEl.text().trim() + " - " + nameEl.text().trim();
            } else if (nameEl != null) {
                name = nameEl.text().trim();
            } else {
                Element h1El = doc.selectFirst("h1");
                if (h1El != null) name = h1El.text().trim();
            }
            data.put("name", name);

            // 2. Extract Price
            Element priceEl = doc.selectFirst(".pdp-price");
            if (priceEl != null) {
                Element strongEl = priceEl.selectFirst("strong");
                if (strongEl != null) {
                    data.put("price", clean(strongEl.text()));
                } else {
                    Element clonedPrice = priceEl.clone();
                    clonedPrice.select("s, .pdp-discount, .pdp-mrp").remove();
                    data.put("price", clean(clonedPrice.text()));
                }
            } else {
                Element discountEl = doc.selectFirst(".pdp-discount");
                data.put("price", discountEl != null ? clean(discountEl.text()) : "0");
            }

            // 3. Extract Image URL
            String imageUrl = "";
            Element imgEl = doc.selectFirst("img.pdp-image");
            if (imgEl == null) imgEl = doc.selectFirst(".image-grid-image");
            if (imgEl != null) {
                imageUrl = imgEl.attr("src");
            }
            data.put("imageUrl", imageUrl);

            // 4. Extract Rating
            String rating = "N/A";
            Element ratingEl = doc.selectFirst(".index-overallRating");
            if (ratingEl != null) rating = ratingEl.text().trim();
            data.put("rating", rating);

            // 5. Extract Availability
            String availability = "In Stock";
            if (doc.text().contains("Out of Stock") || doc.text().contains("Sold Out")) {
                availability = "Out of Stock";
            }
            data.put("availability", availability);

            data.put("website", "MYNTRA");
        }
        return data;
    }

    private String clean(String price) {
        if (price == null) {
            return "0";
        }
        price = price
                .replace("Rs.", "")
                .replace("INR", "")
                .replace("₹", "")
                .replace(",", "")
                .trim();

        price = price.replaceAll("[^0-9.]", "");

        if (price.isEmpty()) {
            return "0";
        }
        return price;
    }

    private Document fetchWithCurl(String url) {
        try {
            log.info("Executing direct curl fetch for URL: {}", url);
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
                log.warn("Curl direct fetch failed with exit code: {}", exitCode);
            }
        } catch (Exception e) {
            log.error("Failed to execute curl: {}", e.getMessage(), e);
        }
        return null;
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
