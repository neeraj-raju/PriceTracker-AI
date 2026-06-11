package com.pricetracker.backend.service;

import com.pricetracker.backend.dto.LiveFeedItemDTO;
import com.pricetracker.backend.dto.PlatformStatDTO;
import com.pricetracker.backend.model.Alert;
import com.pricetracker.backend.model.Product;
import com.pricetracker.backend.repository.AlertRepository;
import com.pricetracker.backend.repository.PriceHistoryRepository;
import com.pricetracker.backend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class StatsService {

    private final ProductRepository productRepository;
    private final PriceHistoryRepository priceHistoryRepository;
    private final AlertRepository alertRepository;

    private final Map<String, Object> statsCache = new ConcurrentHashMap<>();
    private static final String CACHE_KEY_PLATFORM_STATS = "platform_stats";
    private static final String CACHE_KEY_PLATFORM_STATS_TIME = "platform_stats_time";

    private final Map<String, String> platformColors = Map.of(
            "AMAZON", "#FF9900",
            "FLIPKART", "#2874F0",
            "MYNTRA", "#FF3F6C",
            "AJIO", "#EF4056"
    );

    private final Map<String, String> platformDisplayNames = Map.of(
            "AMAZON", "Amazon",
            "FLIPKART", "Flipkart",
            "MYNTRA", "Myntra",
            "AJIO", "Ajio"
    );

    public void invalidateCache() {
        log.info("Invalidating platform stats cache");
        statsCache.remove(CACHE_KEY_PLATFORM_STATS);
        statsCache.remove(CACHE_KEY_PLATFORM_STATS_TIME);
    }

    @SuppressWarnings("unchecked")
    public List<PlatformStatDTO> getPlatformStats() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime cachedTime = (LocalDateTime) statsCache.get(CACHE_KEY_PLATFORM_STATS_TIME);

        if (cachedTime != null && Duration.between(cachedTime, now).toMinutes() < 15) {
            log.info("Returning cached platform stats");
            return (List<PlatformStatDTO>) statsCache.get(CACHE_KEY_PLATFORM_STATS);
        }

        log.info("Calculating fresh platform stats");
        List<PlatformStatDTO> statsList = new ArrayList<>();
        List<String> platforms = Arrays.asList("AMAZON", "FLIPKART", "MYNTRA", "AJIO");

        LocalDateTime sevenDaysAgo = now.minusDays(7);
        LocalDateTime fourteenDaysAgo = now.minusDays(14);

        for (String platform : platforms) {
            // totalTracked
            long totalTracked = productRepository.countActivelyTrackedByWebsite(platform);

            // dropsThisWeek (total price drop alerts sent globally)
            long dropsThisWeek = alertRepository.countAlertsByPlatform(platform);

            // trend calculation based on weekly growth of price drops
            long currentWeekDrops = priceHistoryRepository.countPriceDropsByPlatformAndDateRange(platform, sevenDaysAgo);
            long previousWeekDrops = priceHistoryRepository.countPriceDropsByPlatformAndDateRangeBetween(platform, fourteenDaysAgo, sevenDaysAgo);
            String trend = currentWeekDrops > previousWeekDrops ? "UP" : "STABLE";

            // averageSaving
            Double averageSaving = priceHistoryRepository.findAverageSavingByPlatform(platform).orElse(0.0);

            PlatformStatDTO dto = PlatformStatDTO.builder()
                    .platform(platform)
                    .displayName(platformDisplayNames.get(platform))
                    .colorHex(platformColors.get(platform))
                    .totalTracked(totalTracked)
                    .dropsThisWeek(dropsThisWeek)
                    .averageSaving(averageSaving)
                    .trend(trend)
                    .build();

            statsList.add(dto);
        }

        statsCache.put(CACHE_KEY_PLATFORM_STATS, statsList);
        statsCache.put(CACHE_KEY_PLATFORM_STATS_TIME, now);

        return statsList;
    }

    public List<LiveFeedItemDTO> getLiveFeed() {
        List<Alert> alerts = alertRepository.findActiveAlerts(org.springframework.data.domain.PageRequest.of(0, 8));
        List<LiveFeedItemDTO> feed = new ArrayList<>();

        for (Alert alert : alerts) {
            Optional<Product> prodOpt = productRepository.findById(alert.getProductId());
            String category = prodOpt.map(Product::getCategory).orElse("Electronics");
            if (category == null) {
                category = "Electronics";
            }

            String message = "";
            switch (alert.getAlertType()) {
                case "SIGNIFICANT_DROP":
                    message = String.format("%s on %s dropped %s%%", category, platformDisplayNames.getOrDefault(alert.getPlatform(), alert.getPlatform()), alert.getDropPercent().intValue());
                    break;
                case "ALL_TIME_LOW":
                    message = String.format("%s on %s hit All-Time Low", category, platformDisplayNames.getOrDefault(alert.getPlatform(), alert.getPlatform()));
                    break;
                case "TARGET_PRICE_REACHED":
                    message = String.format("%s on %s reached target price", category, platformDisplayNames.getOrDefault(alert.getPlatform(), alert.getPlatform()));
                    break;
                case "PRICE_RISING_WARNING":
                    message = String.format("%s on %s rising — buy soon", category, platformDisplayNames.getOrDefault(alert.getPlatform(), alert.getPlatform()));
                    break;
                case "BACK_IN_STOCK":
                    message = String.format("%s on %s is back in stock", category, platformDisplayNames.getOrDefault(alert.getPlatform(), alert.getPlatform()));
                    break;
                default:
                    message = String.format("%s on %s updated", category, platformDisplayNames.getOrDefault(alert.getPlatform(), alert.getPlatform()));
            }

            String timeAgo = formatTimeAgo(alert.getCreatedAt());
            String icon = getAlertIcon(alert.getAlertType());

            LiveFeedItemDTO dto = LiveFeedItemDTO.builder()
                    .alertType(alert.getAlertType())
                    .message(message)
                    .platform(alert.getPlatform())
                    .colorHex(platformColors.getOrDefault(alert.getPlatform(), "#888888"))
                    .icon(icon)
                    .timeAgo(timeAgo)
                    .createdAt(alert.getCreatedAt())
                    .build();

            feed.add(dto);
        }

        return feed;
    }

    private String getAlertIcon(String alertType) {
        switch (alertType) {
            case "SIGNIFICANT_DROP": return "📉";
            case "ALL_TIME_LOW": return "🏆";
            case "TARGET_PRICE_REACHED": return "🎯";
            case "PRICE_RISING_WARNING": return "📈";
            case "BACK_IN_STOCK": return "✅";
            default: return "🔔";
        }
    }

    private String formatTimeAgo(LocalDateTime createdAt) {
        if (createdAt == null) return "just now";
        LocalDateTime now = LocalDateTime.now();
        Duration duration = Duration.between(createdAt, now);
        long seconds = duration.getSeconds();
        if (seconds < 60) {
            return "just now";
        }
        long minutes = duration.toMinutes();
        if (minutes < 60) {
            return minutes + " minutes ago";
        }
        long hours = duration.toHours();
        if (hours < 24) {
            return hours + " hours ago";
        }
        long days = duration.toDays();
        if (days == 1) {
            return "1 day ago";
        }
        return days + " days ago";
    }
}
