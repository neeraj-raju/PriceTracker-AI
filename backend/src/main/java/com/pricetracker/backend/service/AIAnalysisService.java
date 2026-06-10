package com.pricetracker.backend.service;

import com.pricetracker.backend.dto.AIInsightReport;
import com.pricetracker.backend.dto.AIInsightStatus;
import com.pricetracker.backend.dto.AIRecommendation;
import com.pricetracker.backend.model.PriceHistory;
import com.pricetracker.backend.model.Product;
import com.pricetracker.backend.repository.PriceHistoryRepository;
import com.pricetracker.backend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.NumberFormat;
import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class AIAnalysisService {

    private final ProductRepository productRepository;
    private final PriceHistoryRepository priceHistoryRepository;

    private final Map<Long, CachedInsight> cache = new ConcurrentHashMap<>();

    private static class CachedInsight {
        final AIInsightReport report;
        final LocalDateTime cachedAt;

        CachedInsight(AIInsightReport report) {
            this.report = report;
            this.cachedAt = LocalDateTime.now();
        }

        boolean isExpired() {
            return cachedAt.plusHours(1).isBefore(LocalDateTime.now());
        }
    }

    public AIInsightReport getCachedOrGenerateReport(Long productId) {
        CachedInsight cached = cache.get(productId);
        if (cached != null && !cached.isExpired()) {
            return cached.report;
        }
        AIInsightReport report = generateReport(productId);
        cache.put(productId, new CachedInsight(report));
        return report;
    }

    public AIInsightReport generateReport(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        List<PriceHistory> history = priceHistoryRepository.findByProductIdOrderByCheckedAtAsc(productId);

        if (history == null || history.size() < 3) {
            return AIInsightReport.builder()
                    .productId(productId)
                    .productName(product.getName())
                    .status(AIInsightStatus.INSUFFICIENT_DATA)
                    .insightText("We need a few more days of data to generate insights. Check back soon.")
                    .generatedAt(LocalDateTime.now())
                    .build();
        }

        // 1. Calculate Stats
        int n = history.size();
        BigDecimal currentPrice = history.get(n - 1).getNewPrice();

        BigDecimal lowestPrice = history.get(0).getNewPrice();
        BigDecimal highestPrice = history.get(0).getNewPrice();
        BigDecimal sumPrice = BigDecimal.ZERO;
        LocalDateTime lowestPriceDate = history.get(0).getCheckedAt();

        int totalDropCount = 0;
        int totalRiseCount = 0;

        List<BigDecimal> allPrices = new ArrayList<>();

        for (PriceHistory record : history) {
            BigDecimal price = record.getNewPrice();
            allPrices.add(price);
            sumPrice = sumPrice.add(price);

            if (price.compareTo(lowestPrice) < 0) {
                lowestPrice = price;
                lowestPriceDate = record.getCheckedAt();
            }
            if (price.compareTo(highestPrice) > 0) {
                highestPrice = price;
            }

            if (record.getOldPrice() != null) {
                if (record.getNewPrice().compareTo(record.getOldPrice()) < 0) {
                    totalDropCount++;
                } else if (record.getNewPrice().compareTo(record.getOldPrice()) > 0) {
                    totalRiseCount++;
                }
            }
        }

        BigDecimal averagePrice = sumPrice.divide(BigDecimal.valueOf(n), 2, RoundingMode.HALF_UP);

        // Volatility standard deviation
        double mean = averagePrice.doubleValue();
        double varianceSum = 0.0;
        for (BigDecimal price : allPrices) {
            varianceSum += Math.pow(price.doubleValue() - mean, 2);
        }
        double priceVolatility = Math.sqrt(varianceSum / n);

        String volatilityDescription;
        double volRatio = averagePrice.doubleValue() > 0 ? priceVolatility / averagePrice.doubleValue() : 0.0;
        if (volRatio < 0.02) {
            volatilityDescription = "low";
        } else if (volRatio > 0.10) {
            volatilityDescription = "high";
        } else {
            volatilityDescription = "moderate";
        }

        LocalDateTime firstDate = history.get(0).getCheckedAt();
        LocalDateTime lastDate = history.get(n - 1).getCheckedAt();
        long daysTracked = ChronoUnit.DAYS.between(firstDate, lastDate);

        double highestVal = highestPrice.doubleValue() > 0 ? highestPrice.doubleValue() : 1.0;
        double lowestVal = lowestPrice.doubleValue() > 0 ? lowestPrice.doubleValue() : 1.0;

        double percentBelowHigh = ((highestVal - currentPrice.doubleValue()) / highestVal) * 100.0;
        double percentAboveLow = ((currentPrice.doubleValue() - lowestVal) / lowestVal) * 100.0;

        // Recent short term trend (last 3 prices)
        String recentTrend;
        BigDecimal p3 = history.get(n - 3).getNewPrice();
        BigDecimal p2 = history.get(n - 2).getNewPrice();
        BigDecimal p1 = history.get(n - 1).getNewPrice();
        if (p3.compareTo(p2) > 0 && p2.compareTo(p1) > 0) {
            recentTrend = "FALLING";
        } else if (p3.compareTo(p2) < 0 && p2.compareTo(p1) < 0) {
            recentTrend = "RISING";
        } else {
            recentTrend = "STABLE";
        }

        // Group by DayOfWeek
        Map<DayOfWeek, List<BigDecimal>> dayGroup = new HashMap<>();
        for (PriceHistory record : history) {
            if (record.getCheckedAt() != null) {
                DayOfWeek dow = record.getCheckedAt().getDayOfWeek();
                dayGroup.computeIfAbsent(dow, k -> new ArrayList<>()).add(record.getNewPrice());
            }
        }

        DayOfWeek cheapestDay = null;
        BigDecimal lowestDayAverage = null;
        for (Map.Entry<DayOfWeek, List<BigDecimal>> entry : dayGroup.entrySet()) {
            BigDecimal sum = BigDecimal.ZERO;
            for (BigDecimal val : entry.getValue()) {
                sum = sum.add(val);
            }
            BigDecimal avg = sum.divide(BigDecimal.valueOf(entry.getValue().size()), 2, RoundingMode.HALF_UP);
            if (lowestDayAverage == null || avg.compareTo(lowestDayAverage) < 0) {
                lowestDayAverage = avg;
                cheapestDay = entry.getKey();
            }
        }

        String cheapestDayOfWeek = "N/A";
        if (cheapestDay != null) {
            cheapestDayOfWeek = cheapestDay.name().charAt(0) + cheapestDay.name().substring(1).toLowerCase();
        }

        // Linear Regression
        double sumX = 0;
        double sumY = 0;
        double sumXY = 0;
        double sumX2 = 0;
        for (int i = 0; i < n; i++) {
            double x = ChronoUnit.DAYS.between(firstDate, history.get(i).getCheckedAt());
            double y = history.get(i).getNewPrice().doubleValue();
            sumX += x;
            sumY += y;
            sumXY += x * y;
            sumX2 += x * x;
        }

        double denominator = n * sumX2 - sumX * sumX;
        double slope = (denominator != 0) ? (n * sumXY - sumX * sumY) / denominator : 0.0;

        String linearTrend;
        if (slope < -5.0) {
            linearTrend = "DECLINING";
        } else if (slope > 5.0) {
            linearTrend = "INCREASING";
        } else {
            linearTrend = "STABLE";
        }

        // Determine recommendation
        AIRecommendation recommendation;
        BigDecimal thresholdBuyNow = lowestPrice.multiply(BigDecimal.valueOf(1.05));
        BigDecimal thresholdGoodDeal = averagePrice.multiply(BigDecimal.valueOf(0.90));

        if (currentPrice.compareTo(thresholdBuyNow) <= 0) {
            recommendation = AIRecommendation.BUY_NOW;
        } else if (currentPrice.compareTo(thresholdGoodDeal) <= 0) {
            recommendation = AIRecommendation.GOOD_DEAL;
        } else if ("FALLING".equals(recentTrend) || "DECLINING".equals(linearTrend)) {
            recommendation = AIRecommendation.WAIT;
        } else {
            recommendation = AIRecommendation.MONITOR;
        }

        // Build natural language report
        NumberFormat nf = NumberFormat.getCurrencyInstance(new Locale("en", "IN"));
        nf.setMaximumFractionDigits(0);

        StringBuilder sb = new StringBuilder();
        sb.append("This product has been tracked for ").append(daysTracked).append(daysTracked == 1 ? " day. " : " days. ");
        sb.append("The price has ranged between ").append(nf.format(lowestPrice))
                .append(" and ").append(nf.format(highestPrice))
                .append(", with an average of ").append(nf.format(averagePrice)).append(". ");

        long pctBelowHigh = Math.round(percentBelowHigh);
        long pctAboveLow = Math.round(percentAboveLow);

        sb.append("The current price of ").append(nf.format(currentPrice))
                .append(" is ").append(pctBelowHigh).append("% below the highest recorded price");

        if (daysTracked >= 7 && lowestPriceDate != null) {
            String dateStr = lowestPriceDate.format(DateTimeFormatter.ofPattern("MMM d", Locale.ENGLISH));
            sb.append(" and only ").append(pctAboveLow).append("% above the all-time low of ")
                    .append(nf.format(lowestPrice)).append(" (reached on ").append(dateStr).append("). ");
        } else {
            sb.append(" and only ").append(pctAboveLow).append("% above the all-time low of ")
                    .append(nf.format(lowestPrice)).append(". ");
        }

        sb.append("Price has dropped ").append(totalDropCount).append(totalDropCount == 1 ? " time " : " times ")
                .append(" and risen ").append(totalRiseCount).append(totalRiseCount == 1 ? " time " : " times ")
                .append(" during the tracking period, indicating ").append(volatilityDescription).append(" volatility. ");

        sb.append("The overall price trend is ").append(linearTrend.toLowerCase()).append(". ");
        sb.append("The recent short-term trend is ").append(recentTrend.toLowerCase()).append(". ");

        if (daysTracked >= 14 && !"N/A".equals(cheapestDayOfWeek)) {
            sb.append("Historically, prices tend to be lowest on ").append(cheapestDayOfWeek).append("s. ");
        }

        switch (recommendation) {
            case BUY_NOW:
                sb.append("Recommendation: This is an excellent time to buy — the price is near its historical low and trending downward.");
                break;
            case GOOD_DEAL:
                sb.append("Recommendation: This is a good deal — the price is significantly below average.");
                break;
            case WAIT:
                sb.append("Recommendation: We recommend waiting — the price has been declining recently or is currently unstable.");
                break;
            case MONITOR:
            default:
                sb.append("Recommendation: We suggest monitoring this product — current prices are stable but not at a historical discount.");
                break;
        }

        return AIInsightReport.builder()
                .productId(productId)
                .productName(product.getName())
                .currentPrice(currentPrice)
                .lowestPrice(lowestPrice)
                .highestPrice(highestPrice)
                .averagePrice(averagePrice)
                .priceVolatility(priceVolatility)
                .daysTracked(daysTracked)
                .totalDropCount(totalDropCount)
                .totalRiseCount(totalRiseCount)
                .recommendation(recommendation)
                .insightText(sb.toString())
                .cheapestDayOfWeek(cheapestDayOfWeek)
                .recentTrend(recentTrend)
                .linearTrend(linearTrend)
                .generatedAt(LocalDateTime.now())
                .status(AIInsightStatus.READY)
                .build();
    }
}
