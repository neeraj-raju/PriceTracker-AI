package com.pricetracker.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class BackendApplication {
	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
		System.out.println("\n╔══════════════════════════════════════════╗");
		System.out.println("║  PriceTracker AI Backend — STARTED ✓    ║");
		System.out.println("║  Running at: http://localhost:8080       ║");
		System.out.println("╚══════════════════════════════════════════╝\n");
	}
}