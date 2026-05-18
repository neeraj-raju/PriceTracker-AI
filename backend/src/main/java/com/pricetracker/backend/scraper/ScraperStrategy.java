package com.pricetracker.backend.scraper;

import java.util.Map;

public interface ScraperStrategy {

    boolean supports(String url);

    Map<String, Object> scrape(String url);
}