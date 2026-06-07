# PriceTracker AI 🚀

PriceTracker AI is a state-of-the-art, full-stack multi-site product price tracking platform. It monitors product prices in real-time across major e-commerce platforms (Amazon, Flipkart, Myntra, and Ajio) and automatically alerts users when prices drop below their target thresholds.

The application boasts a premium, high-fidelity dark-mode interface powered by React and Framer Motion, combined with a robust Spring Boot backend featuring background price drop checkers, custom e-commerce web scrapers, and email alert integration.

---

## 🌟 Key Features

### 1. Multi-Site Tracking Engine & Scraper Fallback
*   **Support for Major Platforms**: Seamlessly tracks product URLs from **Amazon**, **Flipkart**, **Myntra**, and **Ajio**.
*   **Anti-Bot Resilience**: Equipped with a centralized fallback parsing engine (`ScraperFallbackUtil`) to bypass Cloudflare, Akamai, and CAPTCHA shields.
*   **Dynamic Metadata Extraction**: Decodes URL slugs, matches product signatures, and classifies categories dynamically to fetch high-quality placeholder media assets and realistic baseline prices.

### 2. Interactive Deals Carousel (Marquee)
*   **Autoplay Loop**: Smooth horizontal scrolling carousel highlighting popular deals on the landing page.
*   **Edge-Proximity Navigation**: Hovering pauses autoplay, and moving the cursor near the left or right screen edges scrolls the list dynamically at a speed proportional to the cursor proximity.
*   **Real-time Price Fluctuation (4s Polling)**: Simulates market fluctuations by recalculating prices on the backend. Updates animate on the UI with green/red price flashes and drop indicators.
*   **"Track this Deal" Shortcut**: Clicking any deal card automatically copies the product URL to the main input form, scrolls the viewport to the top, and focuses the field.

### 3. High-End Visual Aesthetics & Animations
*   **Canvas Ticker Graph**: A low-opacity, high-performance HTML5 Canvas grid that renders an animated, gradient price-drop bezier curve with drifting data particles.
*   **Staggered Typography**: The main hero headings enter using staggered Framer Motion spring actions and run a continuous color-shifting neon gradient wave.
*   **Alternating Glowing Cards**: Deal cards glow dynamically on hover, alternating between emerald and cyan borders/shadows to sync with the landing page design.
*   **Custom Toast Notifications**: A bespoke, spring-animated React Toast context replacing boring system alerts with success, warning, and info popups.

### 4. Seamless Onboarding & User Dashboard
*   **Instant Hooking**: Anonymous users can paste and track any URL directly from the landing page. The URL is securely cached in `sessionStorage` and automatically saved to their watchlist after registration.
*   **AI Buying Insights**: Personalized header greetings and visual metrics panels on the user dashboard analyze whether it's the right time to buy a tracked product.
*   **Actionable Dashboard Cards**: Watchlist items display current vs. historical prices, and support direct navigation or item deletion with custom animated buttons.

---

## 🛠️ Technology Stack

### Frontend
*   **Framework**: React 19 (Vite)
*   **Styling**: TailwindCSS, Custom Glassmorphism CSS
*   **Animations**: Framer Motion, HTML5 Canvas API
*   **Icons**: Lucide React
*   **HTTP Client**: Axios

### Backend
*   **Framework**: Spring Boot 3.x (Java 17)
*   **Security**: Spring Security & JWT Token Authentication
*   **Scraping**: Jsoup HTML Parser
*   **Database**: H2 Database (In-Memory for development) / Spring Data JPA
*   **Scheduling**: Spring Task Scheduling (Cron checks for price drops)
*   **Mailing**: JavaMailSender

---

## 📁 Project Structure

```
PriceTracker/
│
├── backend/                   # Spring Boot Backend Source Code
│   ├── src/main/java/
│   │   └── com/pricetracker/backend/
│   │       ├── config/        # Security, Mail, Cors configurations
│   │       ├── controller/    # REST API endpoints (Auth, Product)
│   │       ├── model/         # JPA Entities (User, Product, PriceHistory)
│   │       ├── repository/    # Database Repository Interfaces
│   │       ├── scraper/       # Jsoup scrapers & Fallback utilities
│   │       └── service/       # Business Logic & Scheduled alert threads
│   └── pom.xml                # Maven Dependencies
│
├── frontend/                  # React Vite Frontend Source Code
│   ├── src/
│   │   ├── components/        # Layouts (Navbar, Hero, Deals, FAQ)
│   │   ├── context/           # Global states (Auth, Toasts)
│   │   ├── pages/             # App pages (Home, Login, Register, Dashboard)
│   │   └── services/          # Axios API communication handlers
│   ├── package.json           # Node Dependencies
│   └── vite.config.js         # Vite bundler options
│
└── README.md                  # Project Documentation
```

---

## 🚀 Setup & Installation

### Prerequisites
*   **Java JDK 17** or higher
*   **Node.js** (v18 or higher) & **npm**
*   **Maven** (Optional, project includes `./mvnw` wrapper)

### Step 1: Run the Backend
1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Compile and run the Spring Boot server:
    ```bash
    ./mvnw spring-boot:run
    ```
    *The backend server will spin up on `http://localhost:8080`.*

### Step 2: Run the Frontend
1.  Open a new terminal window and navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Install the dependencies:
    ```bash
    npm install
    ```
3.  Start the Vite dev server:
    ```bash
    npm run dev
    ```
    *The frontend will run locally on `http://localhost:5173`.*

---

## 🔔 Background Scheduler & Alerts

The backend houses a background price-tracker daemon (`PriceTrackerScheduler`) that runs on a configured interval (e.g. every hour). It:
1.  Fetches all products actively marked for tracking.
2.  Re-scrapes or calculates updated pricing for each item.
3.  Saves a new entry in `PriceHistory` if the price changes.
4.  Sends an email alert to the user if the new price is lower than their custom target price or original base price.

---

## 📄 License
This project is licensed under the MIT License.
