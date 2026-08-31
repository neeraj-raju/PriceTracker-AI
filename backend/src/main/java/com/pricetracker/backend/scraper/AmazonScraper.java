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
                (url.contains("amazon.in")
                        || url.contains("amazon.com")
                        || url.contains("amzn.in")
                        || url.contains("amzn.to"));
    }

    @Override
    public Map<String, Object> scrape(String url) {

        Map<String, Object> data = new HashMap<>();

        try {
            log.info("Scraping Amazon URL: {}", url);

            Document doc = fetchWithCurlFallback(url);

            Element titleEl = doc.selectFirst("#productTitle");
            if (titleEl == null) titleEl = doc.selectFirst("#title");
            if (titleEl == null) titleEl = doc.selectFirst("h1.a-size-large");
            if (titleEl == null) titleEl = doc.selectFirst("meta[name=title]");
            if (titleEl == null) titleEl = doc.selectFirst("meta[property=\"og:title\"]");

            String productName = "Unknown Product";
            if (titleEl != null) {
                if (titleEl.hasAttr("content")) {
                    productName = titleEl.attr("content").trim();
                } else {
                    productName = titleEl.text().trim();
                }
            }

            data.put("name", productName);

            String price = extractPrice(doc);
            data.put("price", price);

            Element imgEl = doc.selectFirst("#landingImage");
            if (imgEl == null) imgEl = doc.selectFirst("#imgBlkFront");
            if (imgEl == null) imgEl = doc.selectFirst("#main-image");
            if (imgEl == null) imgEl = doc.selectFirst("meta[property=\"og:image\"]");

            String imageUrl = "";
            if (imgEl != null) {
                if (imgEl.hasAttr("src")) {
                    imageUrl = imgEl.attr("src");
                } else if (imgEl.hasAttr("content")) {
                    imageUrl = imgEl.attr("content");
                } else if (imgEl.hasAttr("data-old-hires")) {
                    imageUrl = imgEl.attr("data-old-hires");
                }
            }
            data.put("imageUrl", imageUrl);

            Element ratingEl = doc.selectFirst("span.a-icon-alt");
            data.put("rating", ratingEl != null ? ratingEl.text() : "N/A");

            Element availEl = doc.selectFirst("#availability span");
            data.put("availability", availEl != null ? availEl.text().trim() : "In Stock");

            data.put("website", "AMAZON");

            log.info("SCRAPED DATA: {}", data);

        }
        catch (Exception e) {
            log.warn("Amazon scraping failed, using fallback: {}", e.getMessage());
            return ScraperFallbackUtil.getFallbackScrapedData(url);
        }

        String nameStr = data.get("name") != null ? data.get("name").toString() : "";
        if (nameStr.isEmpty() || nameStr.toLowerCase().contains("unknown") || "0".equals(data.get("price").toString())) {
            log.info("Amazon scrape returned incomplete data. Using fallback for: {}", url);
            return ScraperFallbackUtil.getFallbackScrapedData(url);
        }

        return data;
    }

    private Document fetchWithCurlFallback(String url) throws Exception {
        try {
            return Jsoup.connect(url)
                    .userAgent(userAgent)
                    .header("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8")
                    .header("Accept-Language", "en-US,en;q=0.9")
                    .header("Connection", "keep-alive")
                    .header("Upgrade-Insecure-Requests", "1")
                    .followRedirects(true)
                    .timeout(timeout)
                    .get();
        } catch (org.jsoup.HttpStatusException ex) {
            if (ex.getStatusCode() == 403 || ex.getStatusCode() == 503 || ex.getStatusCode() == 404) {
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

    private boolean isAvoidablePrice(Element el) {
        if (el == null) {
            return false;
        }
        if (isAvoidableElement(el)) {
            return true;
        }
        for (Element parent : el.parents()) {
            if (isAvoidableElement(parent)) {
                return true;
            }
        }
        return false;
    }

    private boolean isAvoidableElement(Element el) {
        if (el == null) {
            return false;
        }
        String id = el.id().toLowerCase();
        String className = el.className().toLowerCase();
        
        if (id.contains("emi") || className.contains("emi") || 
            id.contains("installment") || className.contains("installment") ||
            id.contains("sponsored") || className.contains("sponsored") ||
            id.contains("recommend") || className.contains("recommend") ||
            id.contains("similar") || className.contains("similar") ||
            id.contains("fbt") || id.contains("bought") ||
            className.contains("fbt") || className.contains("bought") ||
            id.contains("sp_detail") || className.contains("sp_detail") ||
            id.contains("personalization") || className.contains("personalization") ||
            className.contains("a-text-price") || className.contains("strike") ||
            id.contains("mrp") || className.contains("mrp") ||
            id.contains("listprice") || className.contains("listprice") ||
            className.contains("list-price") || id.contains("originalprice") ||
            className.contains("original-price") || id.contains("coupon") || 
            className.contains("coupon") || id.contains("bank") ||
            className.contains("bank") || id.contains("offer") ||
            className.contains("offer") || className.contains("a-size-small")) {
            return true;
        }
        
        String ownText = el.ownText().toLowerCase();
        if (ownText.contains("emi starts") || ownText.contains("installment") || 
            ownText.contains("pay over time") || ownText.contains("coupon") || 
            ownText.contains("bank offer") || ownText.contains("save") || 
            ownText.contains("off with") || ownText.contains("mrp") ||
            ownText.contains("original price")) {
            return true;
        }
        
        return false;
    }

    private String extractPrice(Document doc) {
        String[] wrappers = {
            "#corePriceDisplay_desktop_feature_div .a-price",
            "#corePrice_desktop .a-price",
            "#corePrice_feature_div .a-price",
            "#price_inside_buybox .a-price",
            "#apex_desktop .a-price",
            ".a-price"
        };

        for (String selector : wrappers) {
            for (Element priceWrapper : doc.select(selector)) {
                if (isAvoidablePrice(priceWrapper)) {
                    continue;
                }

                Element wholeEl = priceWrapper.selectFirst(".a-price-whole");
                if (wholeEl != null) {
                    String whole = wholeEl.text()
                            .replace(",", "")
                            .replace(".", "")
                            .trim();

                    Element fractionEl = priceWrapper.selectFirst(".a-price-fraction");
                    String fraction = fractionEl != null ? fractionEl.text() : "00";

                    String fullPrice = clean(whole + "." + fraction);
                    if (!"0".equals(fullPrice)) {
                        return fullPrice;
                    }
                }

                Element offscreen = priceWrapper.selectFirst(".a-offscreen");
                if (offscreen != null) {
                    String fullPrice = clean(offscreen.text());
                    if (!"0".equals(fullPrice)) {
                        return fullPrice;
                    }
                }
            }
        }

        String[] fallbackSelectors = {
            "#priceblock_ourprice",
            "#priceblock_dealprice",
            "#priceblock_saleprice"
        };
        for (String selector : fallbackSelectors) {
            Element el = doc.selectFirst(selector);
            if (el != null && !isAvoidablePrice(el)) {
                String fullPrice = clean(el.text());
                if (!"0".equals(fullPrice)) {
                    return fullPrice;
                }
            }
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

        price =
                price.replaceAll(
                        "[^0-9.]",
                        ""
                );

        int dotCount =
                price.length()
                        -
                        price.replace(".", "")
                                .length();

        if (dotCount > 1) {

            int firstDot =
                    price.indexOf(".");

            String left =
                    price.substring(
                            0,
                            firstDot + 1
                    );

            String right =
                    price.substring(
                            firstDot + 1
                    ).replace(".", "");

            price = left + right;
        }

        if (price.isEmpty()) {

            return "0";
        }

        return price;
    }
}