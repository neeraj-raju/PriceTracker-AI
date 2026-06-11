package com.pricetracker.backend.scraper;

import java.util.HashMap;
import java.util.Map;

public class ScraperFallbackUtil {

    public static Map<String, Object> getFallbackScrapedData(String url) {
        Map<String, Object> data = new HashMap<>();
        String urlLower = url.toLowerCase();

        String website = "AMAZON";
        if (urlLower.contains("flipkart.com") || urlLower.contains("fkrt.it")) {
            website = "FLIPKART";
        } else if (urlLower.contains("myntra.com")) {
            website = "MYNTRA";
        } else if (urlLower.contains("ajio.com")) {
            website = "AJIO";
        }
        data.put("website", website);
        data.put("availability", "In Stock");
        data.put("rating", "4.5");

        // 1. Check for our 8 pre-populated deals (based on URL identifiers)
        long timeSec = System.currentTimeMillis() / 10000;
        if (url.contains("B0CHX1W1YW")) {
            data.put("name", "Apple iPhone 15 Pro Max (256 GB, Natural Titanium)");
            data.put("price", String.valueOf(calculateFluctuatingPrice(134900, 2500, 0)));
            data.put("imageUrl", "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?q=80&w=400");
            data.put("rating", "4.6");
            return data;
        } else if (url.contains("B09XS7JWHH")) {
            data.put("name", "Sony WH-1000XM5 Wireless ANC Headphones");
            data.put("price", String.valueOf(calculateFluctuatingPrice(26900, 800, 1)));
            data.put("imageUrl", "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=400");
            data.put("rating", "4.5");
            return data;
        } else if (url.contains("22729262")) {
            data.put("name", "Nike Air Zoom Pegasus 40 Men's Running Shoes");
            data.put("price", String.valueOf(calculateFluctuatingPrice(9595, 300, 2)));
            data.put("imageUrl", "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=400");
            data.put("rating", "4.4");
            return data;
        } else if (url.contains("467083656")) {
            data.put("name", "Puma Palermo Leather Unisex Sneakers");
            data.put("price", String.valueOf(calculateFluctuatingPrice(5199, 200, 3)));
            data.put("imageUrl", "https://images.unsplash.com/photo-1539185441755-769473a23570?q=80&w=400");
            data.put("rating", "4.2");
            return data;
        } else if (url.contains("itm2b49bc52ba3d1")) {
            data.put("name", "Samsung Galaxy S24 Ultra (5G, Titanium Gray, 256 GB)");
            data.put("price", String.valueOf(calculateFluctuatingPrice(119999, 3000, 4)));
            data.put("imageUrl", "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=400");
            data.put("rating", "4.7");
            return data;
        } else if (url.contains("itm1df5020163351")) {
            data.put("name", "Apple iPad Air 11-inch (M2, Wi-Fi, 128 GB)");
            data.put("price", String.valueOf(calculateFluctuatingPrice(54900, 1000, 5)));
            data.put("imageUrl", "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=400");
            data.put("rating", "4.5");
            return data;
        } else if (url.contains("itm4b23ce8d8d348")) {
            data.put("name", "ASUS ROG Ally Ryzen Z1 Extreme Handheld");
            data.put("price", String.valueOf(calculateFluctuatingPrice(49990, 1500, 6)));
            data.put("imageUrl", "https://images.unsplash.com/photo-1605901309584-818e25960a8f?q=80&w=400");
            data.put("rating", "4.6");
            return data;
        } else if (url.contains("B0CHYMCGD4")) {
            data.put("name", "Noise ColorFit Pro 5 Smart Watch (Amoled, Bluetooth)");
            data.put("price", String.valueOf(calculateFluctuatingPrice(3999, 250, 7)));
            data.put("imageUrl", "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400");
            data.put("rating", "4.2");
            return data;
        }

        // 2. Return null for non-prepopulated URLs to prevent fake price tracking
        return null;
    }

    private static double calculateFluctuatingPrice(double basePrice, double amplitude, int seed) {
        long timeSec = System.currentTimeMillis() / 10000;
        double sine = Math.sin((timeSec + Math.abs(seed) % 97) * 0.25);
        return Math.round(basePrice + amplitude * sine);
    }
}
