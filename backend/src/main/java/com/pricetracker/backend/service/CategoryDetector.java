package com.pricetracker.backend.service;

import org.springframework.stereotype.Component;

@Component
public class CategoryDetector {

    public String detectCategory(String productName) {
        if (productName == null || productName.trim().isEmpty()) {
            return "Electronics";
        }

        String nameLower = productName.toLowerCase();

        if (nameLower.contains("earbuds") || nameLower.contains("headphone") || nameLower.contains("earphone")) {
            return "Headphones";
        }
        if (nameLower.contains("phone") || nameLower.contains("mobile") || nameLower.contains("smartphone") 
                || nameLower.contains("iphone") || nameLower.contains("redmi") || nameLower.contains("samsung")) {
            return "Mobiles";
        }
        if (nameLower.contains("watch") || nameLower.contains("smartwatch") || nameLower.contains("band")) {
            return "Watches";
        }
        if (nameLower.contains("shoe") || nameLower.contains("sneaker") || nameLower.contains("boot") 
                || nameLower.contains("sandal") || nameLower.contains("slipper")) {
            return "Footwear";
        }
        if (nameLower.contains("laptop") || nameLower.contains("notebook") || nameLower.contains("macbook")) {
            return "Laptops";
        }
        if (nameLower.contains("tablet") || nameLower.contains("ipad")) {
            return "Tablets";
        }
        if (nameLower.contains("speaker") || nameLower.contains("bluetooth speaker")) {
            return "Speakers";
        }
        if (nameLower.contains("bag") || nameLower.contains("backpack") || nameLower.contains("wallet")) {
            return "Bags";
        }
        if (nameLower.contains("bottle") || nameLower.contains("flask")) {
            return "Daily Use";
        }
        if (nameLower.contains("shirt") || nameLower.contains("pant") || nameLower.contains("jean") 
                || nameLower.contains("trouser") || nameLower.contains("cargo") || nameLower.contains("kurta") 
                || nameLower.contains("jacket") || nameLower.contains("hoodie") || nameLower.contains("sweatshirt") 
                || nameLower.contains("dress") || nameLower.contains("suit") || nameLower.contains("tee") 
                || nameLower.contains("tshirt") || nameLower.contains("clothing") || nameLower.contains("top")) {
            return "Apparel";
        }

        return "Electronics";
    }
}
