package com.pricetracker.backend.controller;

import com.pricetracker.backend.dto.LiveFeedItemDTO;
import com.pricetracker.backend.dto.PlatformStatDTO;
import com.pricetracker.backend.service.StatsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
@Slf4j
public class StatsController {

    private final StatsService statsService;

    @GetMapping("/platform-summary")
    public ResponseEntity<List<PlatformStatDTO>> getPlatformSummary() {
        try {
            List<PlatformStatDTO> stats = statsService.getPlatformStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("Error retrieving platform summary stats: ", e);
            return ResponseEntity.ok(new ArrayList<>());
        }
    }

    @GetMapping("/live-feed")
    public ResponseEntity<List<LiveFeedItemDTO>> getLiveFeed() {
        try {
            List<LiveFeedItemDTO> feed = statsService.getLiveFeed();
            return ResponseEntity.ok(feed);
        } catch (Exception e) {
            log.error("Error retrieving live feed items: ", e);
            return ResponseEntity.ok(new ArrayList<>());
        }
    }
}
