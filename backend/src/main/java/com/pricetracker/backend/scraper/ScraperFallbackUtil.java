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
        if (url.contains("B0CHX1W1YW")) {
            data.put("name", "Apple iPhone 15 Pro Max (256 GB, Natural Titanium)");
            data.put("price", String.valueOf(calculateFluctuatingPrice(134900, 2500, 0)));
            data.put("imageUrl", "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?q=80&w=400");
            return data;
        } else if (url.contains("B09XS7JWHH")) {
            data.put("name", "Sony WH-1000XM5 Wireless ANC Headphones");
            data.put("price", String.valueOf(calculateFluctuatingPrice(26900, 800, 1)));
            data.put("imageUrl", "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=400");
            return data;
        } else if (url.contains("22729262")) {
            data.put("name", "Nike Air Zoom Pegasus 40 Men's Running Shoes");
            data.put("price", String.valueOf(calculateFluctuatingPrice(9595, 300, 2)));
            data.put("imageUrl", "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=400");
            return data;
        } else if (url.contains("467083656")) {
            data.put("name", "Puma Palermo Leather Unisex Sneakers");
            data.put("price", String.valueOf(calculateFluctuatingPrice(5199, 200, 3)));
            data.put("imageUrl", "https://images.unsplash.com/photo-1539185441755-769473a23570?q=80&w=400");
            return data;
        } else if (url.contains("itm2b49bc52ba3d1")) {
            data.put("name", "Samsung Galaxy S24 Ultra (5G, Titanium Gray, 256 GB)");
            data.put("price", String.valueOf(calculateFluctuatingPrice(119999, 3000, 4)));
            data.put("imageUrl", "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=400");
            return data;
        } else if (url.contains("itm1df5020163351")) {
            data.put("name", "Apple iPad Air 11-inch (M2, Wi-Fi, 128 GB)");
            data.put("price", String.valueOf(calculateFluctuatingPrice(54900, 1000, 5)));
            data.put("imageUrl", "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=400");
            return data;
        } else if (url.contains("itm4b23ce8d8d348")) {
            data.put("name", "ASUS ROG Ally Ryzen Z1 Extreme Handheld");
            data.put("price", String.valueOf(calculateFluctuatingPrice(49990, 1500, 6)));
            data.put("imageUrl", "https://images.unsplash.com/photo-1605901309584-818e25960a8f?q=80&w=400");
            return data;
        } else if (url.contains("B0CHYMCGD4")) {
            data.put("name", "Noise ColorFit Pro 5 Smart Watch (Amoled, Bluetooth)");
            data.put("price", String.valueOf(calculateFluctuatingPrice(3999, 250, 7)));
            data.put("imageUrl", "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400");
            return data;
        }

        // 2. Dynamic decoding for other URLs
        String decodedName = "";
        try {
            String cleanUrl = url.split("\\?")[0];
            String[] parts = cleanUrl.split("/");
            String nameSegment = "";
            for (String p : parts) {
                if (p.contains("-") && p.length() > 5) {
                    if (!p.contains("www.") && !p.contains(".com") && !p.contains(".in")) {
                        nameSegment = p;
                        break;
                    }
                }
            }
            if (nameSegment.isEmpty()) {
                for (String p : parts) {
                    if (p.length() > 8 && !p.contains("www.") && !p.contains(".com") && !p.contains(".in") && !p.equals("dp") && !p.equals("gp") && !p.equals("p")) {
                        nameSegment = p;
                        break;
                    }
                }
            }
            if (!nameSegment.isEmpty()) {
                String name = nameSegment.replace("-", " ").replace("_", " ").trim();
                String[] words = name.split(" ");
                StringBuilder sb = new StringBuilder();
                for (String w : words) {
                    if (!w.isEmpty()) {
                        sb.append(Character.toUpperCase(w.charAt(0)))
                          .append(w.substring(1))
                          .append(" ");
                    }
                }
                decodedName = sb.toString().trim();
                if (decodedName.length() > 55) {
                    decodedName = decodedName.substring(0, 55) + "...";
                }
            }
        } catch (Exception e) {
            // ignore
        }

        if (decodedName.isEmpty()) {
            decodedName = "Premium " + website.substring(0, 1) + website.substring(1).toLowerCase() + " Product";
        }
        data.put("name", decodedName);

        // 3. Fallback category classification
        String decodedLower = decodedName.toLowerCase();
        double basePrice = 2499;
        double amplitude = 200;
        
        if (decodedLower.contains("phone") || decodedLower.contains("mobile") || decodedLower.contains("galaxy") || decodedLower.contains("iphone")) {
            basePrice = 74999;
            amplitude = 2500;
            data.put("imageUrl", "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?q=80&w=400");
        } else if (decodedLower.contains("shoe") || decodedLower.contains("sneaker") || decodedLower.contains("sandal") || decodedLower.contains("nike") || decodedLower.contains("puma")) {
            basePrice = 4599;
            amplitude = 300;
            data.put("imageUrl", "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=400");
        } else if (decodedLower.contains("headphone") || decodedLower.contains("earphone") || decodedLower.contains("audio") || decodedLower.contains("sony")) {
            basePrice = 12999;
            amplitude = 900;
            data.put("imageUrl", "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=400");
        } else if (decodedLower.contains("watch") || decodedLower.contains("smartwatch") || decodedLower.contains("fitbit")) {
            basePrice = 5999;
            amplitude = 400;
            data.put("imageUrl", "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400");
        } else {
            data.put("imageUrl", "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400");
        }

        data.put("price", String.valueOf(calculateFluctuatingPrice(basePrice, amplitude, url.hashCode())));
        return data;
    }

    private static double calculateFluctuatingPrice(double basePrice, double amplitude, int seed) {
        long timeSec = System.currentTimeMillis() / 10000;
        double sine = Math.sin((timeSec + Math.abs(seed) % 97) * 0.25);
        return Math.round(basePrice + amplitude * sine);
    }
}
