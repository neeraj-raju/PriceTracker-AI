# PriceTracker AI 🚀

PriceTracker AI is a state-of-the-art, full-stack multi-site product price tracking, intelligence, and analysis platform. It monitors product prices in real-time across major Indian e-commerce sites (**Amazon**, **Flipkart**, **Myntra**, and **Ajio**) and automatically alerts users via email or web push notifications when prices drop below their target thresholds.

The application features a premium, high-fidelity dark-mode interface powered by **React** and **Framer Motion**, combined with a robust **Spring Boot** backend leveraging background price-checking crons, custom resilient web scrapers, dynamic AI forecasting engines, and secure watchlist managers.

---

## 🌟 Key Features

### 1. Platform Status Intelligence (Animated Stats Strip)
*   **Active Price Drops First**: Displays real-time aggregated stats showing the exact count of **Price Drops Sent** (primary metric) and **Monitored Products** (secondary metric) per shopping platform, computed globally across all registered users.
*   **Average Savings Tracker**: Dynamically tracks and displays accurate average money saved per platform for all triggered alerts.
*   **High-Tech Micro-Animations**: Built with a custom count-up hook utilizing `requestAnimationFrame` for fluid statistical increments, custom glowing borders, sweeping hover shine, and dynamic glassmorphism cards.
*   **Zero Mismatches**: Computes stats dynamically on-the-fly, ensuring perfect consistency between user alerts and the public platform dashboard.

### 2. Live Price Activity Feed
*   **Drop-Only Filter**: A live home-page feed showing the latest price drops (`SIGNIFICANT_DROP`, `ALL_TIME_LOW`, `TARGET_PRICE_REACHED`) for actively tracked items.
*   **Active Watchlist Verification**: Uses optimized database-level `EXISTS` subqueries to guarantee that removed, soft-deleted, or inactive watchlists never pollute the public feed.
*   **Automatic Cache Invalidation**: Caches global stats for blazing-fast responses, automatically invalidating and recalculating on new scrapes or price drops.

### 3. AI Price Intelligence & Forecasting
*   **100% Real Database Calculations**: No hardcoded mocks or manual training required. Computes real-time reports based entirely on historical price logs in the database.
*   **Linear Regression Trend Analysis**: Uses mathematical slope calculations over historical data points to predict if the price trend is moving upwards or downwards.
*   **Volatility Standard Deviation**: Computes standard deviation to classify price volatility (Low, Moderate, High) to inform purchase decisions.
*   **Cheapest Day Analysis**: Aggregates prices by day of the week to historically forecast which day has the cheapest deals on average.
*   **Smart Purchase Recommendation Engine**: Automatically evaluates target thresholds, regression trends, and historical averages to output recommendation badges: `Buy Now`, `Good Deal`, `Wait`, or `Monitor`.

### 4. Side-by-Side Product Comparison Groups
*   **Multi-Store Groups**: Organize diverse product listings together into custom comparison panels (e.g., "Flagship Smart Phones").
*   **Best Price Finder**: Automatically flags and highlights the cheapest platform across all grouped items side-by-side dynamically.

### 5. Multi-Site Tracking Engine & Scraper Fallbacks
*   **Supported Platforms**: Handles live product URLs from **Amazon**, **Flipkart**, **Myntra**, and **Ajio**.
*   **Anti-Bot Resilience**: Equipped with dual Jsoup + direct curl fallbacks and selective header bypasses to reliably scrape price details.
*   **Anti-Mock Safety**: Automatically registers scraping failures as `null` to avoid corrupted price aggregates or false drop notifications.
*   **EMI Filter**: Filters out EMI structures, original price tags, and secondary advertisements to capture only the live, real product checkout price.

### 6. Multi-Channel Notifications
*   **Rich HTML Email Dispatcher**: Integrates JavaMailSender to dispatch beautifully formatted price drop alerts containing check-out links and percentage price drops.
*   **Browser Web Push Notifications**: Standard-compliant Web Push subscription using dynamic VAPID keys. Sends push notifications displaying on desktop or mobile even when the app tab is closed.

### 7. Interactive REST API Documentation
*   **Swagger-Style API Reference Modal**: An interactive modal integrated into the footer that documents authentication, watchlist management, comparison groups, and statistics endpoints, complete with request schemas, responses, and interactive test structures.

---

## 🛠️ Technology Stack

### Frontend
*   **Framework**: React 18 (Vite-powered)
*   **Styling**: Vanilla CSS, Custom Glassmorphism Theme, TailwindCSS
*   **Animations**: Framer Motion, HTML5 Canvas API, Web Animation APIs
*   **Icons**: Lucide React
*   **HTTP Client**: Axios

### Backend
*   **Framework**: Spring Boot 3.x (Java 17)
*   **Security**: Spring Security & JWT Token Authentication
*   **Scraping**: Jsoup HTML Parser + Curl Fallbacks
*   **Database**: MySQL Database (Port 3306) / Spring Data JPA
*   **Scheduling**: Spring Task Scheduling (runs background price checks)
*   **Mailing**: JavaMailSender (Gmail SMTP integration)
*   **Push Engine**: Webpush (VAPID key signatures)

---

## 📁 Project Structure

```
PriceTracker/
│
├── backend/                   # Spring Boot Backend Source Code
│   ├── src/main/java/
│   │   └── com/pricetracker/backend/
│   │       ├── config/        # Security, Mail, Cors, WebPush configurations
│   │       ├── controller/    # REST API endpoints (Auth, Product, Stats, Comparison)
│   │       ├── dto/           # Data Transfer Objects (Alerts, Insights, LiveFeed)
│   │       ├── model/         # JPA Entities (User, Product, PriceHistory, Alert, UserTracking)
│   │       ├── repository/    # Database Repository Interfaces (Alert, UserTracking)
│   │       ├── scraper/       # Jsoup scrapers & Fallback utilities
│   │       └── service/       # Business Logic (AI Analysis, Stats, WebPush, Email)
│   └── pom.xml                # Maven Dependencies
│
├── frontend/                  # React Vite Frontend Source Code
│   ├── src/
│   │   ├── components/        # Layouts (Navbar, Hero, Deals, FAQ, LiveActivityFeed, StatsStrip)
│   │   ├── context/           # Global states (Auth, Toasts)
│   │   ├── pages/             # App pages (Home, Login, Register, Dashboard, ComparisonPage)
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
*   **MySQL Server** (running on port 3306, database: `pricetracker`)

### Step 1: Configure Database & Mail
In `backend/src/main/resources/application.properties`, configure your MySQL credentials and SMTP mail settings:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/pricetracker
spring.datasource.username=your_username
spring.datasource.password=your_password

spring.mail.username=your_gmail@gmail.com
spring.mail.password=your_app_password
```

### Step 2: Run the Backend
1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Compile and run the Spring Boot server:
    ```bash
    ./mvnw spring-boot:run
    ```
    *The backend server will spin up on `http://localhost:8080`.*

### Step 3: Run the Frontend
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

## 💾 Database Schema Integrity (Cascade Deletes)
To ensure absolute referential integrity, database foreign keys are optimized with cascading rules. If a product or user is deleted, their associated watchlists, alerts, and price history data points are instantly cleaned up at the MySQL database level:
*   `price_history` -> `products(id)` [ON DELETE CASCADE]
*   `user_tracking` -> `products(id)` [ON DELETE CASCADE]
*   `user_tracking` -> `users(id)` [ON DELETE CASCADE]
*   `alerts` -> `products(id)` [ON DELETE CASCADE]

---

## 📄 License
This project is licensed under the MIT License.
