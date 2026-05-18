package com.pricetracker.backend.scraper;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import java.util.List;

@Component
@RequiredArgsConstructor
public class ScraperFactory {

    private final List<ScraperStrategy> scrapers;

    public ScraperStrategy getScraperFor(String url) {
        return scrapers.stream()
                .filter(s -> s.supports(url))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException(
                        "No scraper available for: " + url));
    }

    public boolean isSupportedUrl(String url) {
        return scrapers.stream().anyMatch(s -> s.supports(url));
    }
}