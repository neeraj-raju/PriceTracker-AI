package com.pricetracker.backend.scraper;

import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.HashMap;
import java.util.Map;

@Component
@Slf4j
public class FlipkartScraper implements ScraperStrategy {

    @Value("${app.scraper.user-agent}")
    private String userAgent;

    @Value("${app.scraper.timeout}")
    private int timeout;

    @Override
    public boolean supports(String url) {
        return url != null && (url.contains("flipkart.com") || url.contains("fkrt.it"));
    }

    @Override
    public Map<String, Object> scrape(String url) {
        Map<String, Object> data = new HashMap<>();

        try {
            // Rewrite mobile/deep link structures to desktop format to bypass deep-link blocks
            if (url != null) {
                if (url.contains("dl.flipkart.com/dl/")) {
                    url = url.replace("dl.flipkart.com/dl/", "www.flipkart.com/");
                } else if (url.contains("dl.flipkart.com/s/")) {
                    url = url.replace("dl.flipkart.com/s/", "www.flipkart.com/s/");
                }
            }

            log.info("Scraping Flipkart URL: {}", url);

            Document doc = fetchWithCurlFallback(url);

            // Initial placeholders
            String productName = "Unknown Flipkart Product";
            String price = "0";
            String imageUrl = "";
            String rating = "N/A";
            String availability = "In Stock";
            boolean parsedJsonLd = false;

            // 1. High-Reliability Path: Extract metadata from JSON-LD
            Element jsonLdEl = doc.selectFirst("script[type=application/ld+json]");
            if (jsonLdEl != null) {
                try {
                    String jsonLdHtml = jsonLdEl.html().trim();
                    ObjectMapper mapper = new ObjectMapper();
                    JsonNode rootNode = mapper.readTree(jsonLdHtml);

                    JsonNode productNode = rootNode;
                    if (rootNode.isArray() && rootNode.size() > 0) {
                        productNode = rootNode.get(0);
                    } else if (rootNode.isObject() && rootNode.has("@graph")) {
                        JsonNode graphNode = rootNode.path("@graph");
                        if (graphNode.isArray()) {
                            for (JsonNode node : graphNode) {
                                if ("Product".equalsIgnoreCase(node.path("@type").asText())) {
                                    productNode = node;
                                    break;
                                }
                            }
                        }
                    }

                    // Extract Name
                    if (productNode.has("name")) {
                        productName = productNode.path("name").asText().trim();
                    }

                    // Extract Price (supports standard price and lowPrice)
                    JsonNode offersNode = productNode.path("offers");
                    if (offersNode.isObject()) {
                        if (offersNode.has("price")) {
                            price = offersNode.path("price").asText().trim();
                        } else if (offersNode.has("lowPrice")) {
                            price = offersNode.path("lowPrice").asText().trim();
                        }
                    } else if (offersNode.isArray() && offersNode.size() > 0) {
                        JsonNode firstOffer = offersNode.get(0);
                        if (firstOffer.has("price")) {
                            price = firstOffer.path("price").asText().trim();
                        } else if (firstOffer.has("lowPrice")) {
                            price = firstOffer.path("lowPrice").asText().trim();
                        }
                    }

                    // Extract Image URL
                    JsonNode imageNode = productNode.path("image");
                    if (imageNode.isArray() && imageNode.size() > 0) {
                        imageUrl = imageNode.get(0).asText().trim();
                    } else if (imageNode.isTextual()) {
                        imageUrl = imageNode.asText().trim();
                    }

                    // Extract Rating
                    JsonNode ratingNode = productNode.path("aggregateRating");
                    if (ratingNode.isObject() && ratingNode.has("ratingValue")) {
                        rating = ratingNode.path("ratingValue").asText().trim();
                    }

                    // Extract Availability
                    if (offersNode.isObject() && offersNode.has("availability")) {
                        String avail = offersNode.path("availability").asText();
                        availability = avail.contains("InStock") ? "In Stock" : "Out of Stock";
                    } else if (offersNode.isArray() && offersNode.size() > 0) {
                        String avail = offersNode.get(0).path("availability").asText();
                        availability = avail.contains("InStock") ? "In Stock" : "Out of Stock";
                    }

                    // Ensure we parsed a valid price and name, otherwise trigger selector fallback
                    if ("Unknown Flipkart Product".equals(productName) || "0".equals(price)) {
                        parsedJsonLd = false;
                        log.warn("JSON-LD parse yielded incomplete data (name: {}, price: {}). Falling back to CSS selectors.", productName, price);
                    } else {
                        parsedJsonLd = true;
                        log.info("Flipkart parsed successfully via application/ld+json!");
                    }
                } catch (Exception ex) {
                    log.warn("Failed to parse Flipkart JSON-LD, falling back to CSS selectors: {}", ex.getMessage());
                }
            }

            // 2. Fallback Path: Standard CSS Selectors (if JSON-LD is missing/fails)
            if (!parsedJsonLd) {
                Element titleEl = doc.selectFirst(".VU-ZEz");
                if (titleEl == null) titleEl = doc.selectFirst("h1 span.B3Cm5u");
                if (titleEl == null) titleEl = doc.selectFirst("span.B3Cm5u");
                if (titleEl == null) titleEl = doc.selectFirst("h1");
                
                if (titleEl != null) {
                    productName = titleEl.text().trim();
                    if (productName.endsWith("... more")) {
                        productName = productName.substring(0, productName.length() - 8).trim();
                    } else if (productName.endsWith("... read more")) {
                        productName = productName.substring(0, productName.length() - 13).trim();
                    }
                }

                price = extractPrice(doc);

                Element imgEl = doc.selectFirst("img.q6DClP");
                if (imgEl == null) imgEl = doc.selectFirst(".CXW8mj img");
                if (imgEl == null) imgEl = doc.selectFirst("img._396cs4");
                if (imgEl == null) imgEl = doc.selectFirst("img.DByo1Z");
                if (imgEl != null) {
                    imageUrl = imgEl.attr("src");
                    if (imageUrl.isEmpty()) imageUrl = imgEl.attr("data-src");
                }

                Element ratingEl = doc.selectFirst("div.XQD0A-");
                if (ratingEl == null) ratingEl = doc.selectFirst("div._3LWZlK");
                if (ratingEl == null) ratingEl = doc.selectFirst("span.ip33D3");
                if (ratingEl != null) rating = ratingEl.text().trim();

                boolean isOutOfStock = doc.selectFirst(".UOM29m") != null
                        || doc.selectFirst("._15cDXT") != null
                        || doc.text().contains("This item is currently out of stock")
                        || doc.text().contains("Sold Out");
                if (isOutOfStock) {
                    availability = "Out of Stock";
                }
            }

            data.put("name", productName);
            data.put("price", price);
            data.put("imageUrl", imageUrl);
            data.put("rating", rating);
            data.put("availability", availability);
            data.put("website", "FLIPKART");
            log.info("Flipkart Scraped Data: {}", data);

        } catch (Exception e) {
            log.error("Error scraping Flipkart product: {}", url, e);
            data.put("name", "Unknown Flipkart Product");
            data.put("price", "0");
            data.put("website", "FLIPKART");
            data.put("imageUrl", "");
            data.put("rating", "N/A");
            data.put("availability", "Unknown");
        }

        return data;
    }

    private String extractPrice(Document doc) {
        Element priceEl = doc.selectFirst(".Nx9OIx"); // Modern Flipkart price wrapper
        if (priceEl == null) priceEl = doc.selectFirst(".yKfJKb");
        if (priceEl == null) priceEl = doc.selectFirst("div._30jeq3"); // Legacy price class
        if (priceEl == null) priceEl = doc.selectFirst(".hlbyli");
        
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
