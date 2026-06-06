package com.pricetracker.backend;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.junit.jupiter.api.Test;

class BackendApplicationTests {

	@Test
	void testScrapeFlipkart() {
		String rawUrl = "https://dl.flipkart.com/dl/fire-boltt-rise-luxe-bluetooth-calling-47mm-1-85-metal-body-rotating-crown-123-sports-smartwatch/p/itmac74214cdfe0f?pid=SMWH9TRZVH8FGFDQ&lid=LSTSMWH9TRZVH8FGFDQHPG5GU&hl_lid=&marketplace=FLIPKART&fm=eyJ3dHAiOiJyZWNvIiwicHJwdCI6InBwIiwibWlkIjoicHJvZHVjdFJlY29tbWVuZGF0aW9uL3NpbWlsYXIifQ==&_refId=&_appId=CL";
		
		// Rewrite dl.flipkart.com/dl/ -> www.flipkart.com/
		String url = rawUrl.replace("dl.flipkart.com/dl/", "www.flipkart.com/")
		                   .replace("dl.flipkart.com/s/", "www.flipkart.com/s/");
		
		try {
			System.out.println("TEST SCRAPE STARTING WITH GOOGLEBOT USER AGENT...");
			Document doc = Jsoup.connect(url)
					.userAgent("Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)")
					.header("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8")
					.header("Accept-Language", "en-US,en;q=0.9")
					.timeout(15000)
					.get();

			System.out.println("FETCHED DOC TITLE: " + doc.title());
			System.out.println("DOC BODY LENGTH: " + doc.body().text().length());

			// Try to extract name
			Element titleEl = doc.selectFirst(".VU-ZEz");
			System.out.println(".VU-ZEz: " + (titleEl != null ? titleEl.text() : "null"));

			Element titleEl2 = doc.selectFirst("h1 span.B3Cm5u");
			System.out.println("h1 span.B3Cm5u: " + (titleEl2 != null ? titleEl2.text() : "null"));

			Element h1El = doc.selectFirst("h1");
			System.out.println("h1: " + (h1El != null ? h1El.text() : "null"));

			// Try to extract price
			Element priceEl = doc.selectFirst(".Nx9OIx");
			System.out.println(".Nx9OIx: " + (priceEl != null ? priceEl.text() : "null"));

			Element priceEl2 = doc.selectFirst("div._30jeq3");
			System.out.println("div._30jeq3: " + (priceEl2 != null ? priceEl2.text() : "null"));

			// Try to extract price from meta tags or json-ld
			Elements jsonLds = doc.select("script[type=application/ld+json]");
			System.out.println("FOUND JSON-LDS: " + jsonLds.size());
			for (Element script : jsonLds) {
				System.out.println("JSON-LD Content: " + script.html());
			}

		} catch (Exception e) {
			e.printStackTrace();
		}
	}
}
