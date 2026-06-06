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

            System.out.println("Scraping URL: " + url);

            Document doc = Jsoup.connect(url)
                    .userAgent(userAgent)
                    .header("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8")
                    .header("Accept-Language", "en-US,en;q=0.9")
                    .header("Connection", "keep-alive")
                    .header("Upgrade-Insecure-Requests", "1")
                    .timeout(timeout)
                    .get();

            Element titleEl =
                    doc.selectFirst("#productTitle");

            String productName =
                    titleEl != null
                            ? titleEl.text().trim()
                            : "Unknown Product";

            data.put("name", productName);

            String price =
                    extractPrice(doc);

            data.put("price", price);

            Element imgEl =
                    doc.selectFirst("#landingImage");

            data.put(
                    "imageUrl",
                    imgEl != null
                            ? imgEl.attr("src")
                            : ""
            );

            Element ratingEl =
                    doc.selectFirst("span.a-icon-alt");

            data.put(
                    "rating",
                    ratingEl != null
                            ? ratingEl.text()
                            : "N/A"
            );

            Element availEl =
                    doc.selectFirst("#availability span");

            data.put(
                    "availability",
                    availEl != null
                            ? availEl.text().trim()
                            : "Unknown"
            );

            data.put("website", "AMAZON");

            System.out.println(
                    "SCRAPED DATA: " + data
            );

        }
        catch (Exception e) {

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

        Element wholeEl =
                doc.selectFirst(".a-price-whole");

        if (wholeEl != null) {

            String whole =
                    wholeEl.text()
                            .replace(",", "")
                            .replace(".", "")
                            .trim();

            Element fractionEl =
                    doc.selectFirst(".a-price-fraction");

            String fraction =
                    fractionEl != null
                            ? fractionEl.text()
                            : "00";

            return clean(
                    whole + "." + fraction
            );
        }

        Element offscreen =
                doc.selectFirst(".a-price .a-offscreen");

        if (offscreen != null) {

            return clean(
                    offscreen.text()
            );
        }

        Element price1 =
                doc.selectFirst("#priceblock_ourprice");

        if (price1 != null) {

            return clean(
                    price1.text()
            );
        }

        Element price2 =
                doc.selectFirst("#priceblock_dealprice");

        if (price2 != null) {

            return clean(
                    price2.text()
            );
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