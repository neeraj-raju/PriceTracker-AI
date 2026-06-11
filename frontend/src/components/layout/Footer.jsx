import React, { useState } from "react"
import { Link } from "react-router-dom"
import { ExternalLink, X, Code, Key, List, Activity, GitCompare } from "lucide-react"

export default function Footer() {
  const [isApiOpen, setIsApiOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("auth")

  const apiEndpoints = {
    auth: [
      {
        method: "POST",
        path: "/api/auth/register",
        desc: "Registers a new user on the platform with secure password hashing.",
        request: `{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "phoneNumber": "+919999999999"
}`,
        response: `{
  "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ...",
  "name": "John Doe",
  "email": "john@example.com"
}`
      },
      {
        method: "POST",
        path: "/api/auth/login",
        desc: "Authenticates credentials and returns a secure JSON Web Token (JWT).",
        request: `{
  "email": "john@example.com",
  "password": "securePassword123"
}`,
        response: `{
  "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ...",
  "name": "John Doe",
  "email": "john@example.com"
}`
      }
    ],
    products: [
      {
        method: "POST",
        path: "/api/products/track",
        desc: "Submits a new URL to initiate continuous automated tracking.",
        request: `{
  "url": "https://amzn.in/d/05uKxLvQ",
  "targetPrice": 25000,
  "alertPreference": "EMAIL" // or 'PUSH', 'BOTH'
}`,
        response: `{
  "id": 30,
  "name": "Sony WH-1000XM5 ANC Headphones",
  "currentPrice": 28541.00,
  "url": "https://amzn.in/d/05uKxLvQ",
  "website": "AMAZON",
  "imageUrl": "https://m.media-amazon.com/...",
  "availability": "In Stock"
}`
      },
      {
        method: "GET",
        path: "/api/products",
        desc: "Retrieves all active product watchlists for the authenticated user.",
        request: "Headers:\nAuthorization: Bearer <JWT_TOKEN>",
        response: `[
  {
    "id": 30,
    "name": "Sony WH-1000XM5 ANC Headphones",
    "currentPrice": 28541.00,
    "website": "AMAZON",
    "availability": "In Stock"
  }
]`
      },
      {
        method: "GET",
        path: "/api/products/{id}/history",
        desc: "Returns historical price data points tracked over time for chart plotting.",
        request: "Headers:\nAuthorization: Bearer <JWT_TOKEN>",
        response: `[
  {
    "id": 176,
    "oldPrice": 28537.00,
    "newPrice": 28537.00,
    "priceDropped": false,
    "checkedAt": "2026-06-10T12:23:35.300"
  }
]`
      },
      {
        method: "GET",
        path: "/api/products/{id}/ai-insight",
        desc: "Generates an advanced statistical price intelligence and trend report.",
        request: "Headers:\nAuthorization: Bearer <JWT_TOKEN>",
        response: `{
  "productId": 31,
  "productName": "Apple iPhone 17 Pro Max 256 GB",
  "currentPrice": 113989.00,
  "lowestPrice": 113989.00,
  "highestPrice": 206899.00,
  "averagePrice": 155172.00,
  "priceVolatility": 38101.40,
  "daysTracked": 1,
  "recommendation": "BUY_NOW",
  "insightText": "This product has been tracked for 1 day...",
  "recentTrend": "FALLING",
  "linearTrend": "DECLINING"
}`
      }
    ],
    stats: [
      {
        method: "GET",
        path: "/api/stats/platform-summary",
        desc: "Returns platform-wide aggregates for home page stats display.",
        request: "Public Endpoint",
        response: `[
  {
    "platform": "AMAZON",
    "displayName": "Amazon",
    "colorHex": "#FF9900",
    "totalTracked": 5,
    "dropsThisWeek": 1,
    "averageSaving": 92910.0,
    "trend": "UP"
  }
]`
      },
      {
        method: "GET",
        path: "/api/stats/live-feed",
        desc: "Returns the 8 most recent real price drop alerts for active products globally.",
        request: "Public Endpoint",
        response: `[
  {
    "alertType": "ALL_TIME_LOW",
    "message": "Mobiles on Amazon hit All-Time Low",
    "platform": "AMAZON",
    "colorHex": "#FF9900",
    "icon": "🏆",
    "timeAgo": "22 minutes ago",
    "createdAt": "2026-06-11T13:11:58.299"
  }
]`
      }
    ],
    compare: [
      {
        method: "POST",
        path: "/api/comparison/groups",
        desc: "Groups multiple store URLs together to monitor side-by-side comparison pricing.",
        request: `{
  "groupName": "Flagship Phones",
  "productUrls": [
    "https://www.amazon.in/dp/...",
    "https://dl.flipkart.com/dl/..."
  ]
}`,
        response: `{
  "id": "e3073188-3a15-4f9b-c3c4-5bd4f86ac10b",
  "groupName": "Flagship Phones",
  "createdAt": "2026-06-11T14:10:00"
}`
      },
      {
        method: "GET",
        path: "/api/comparison/groups/{id}",
        desc: "Calculates the dynamic comparison results and highlights the cheapest store option.",
        request: "Headers:\nAuthorization: Bearer <JWT_TOKEN>",
        response: `{
  "groupId": "e3073188-3a15-4f9b-c3c4-5bd4f86ac10b",
  "groupName": "Flagship Phones",
  "cheapestProduct": {
    "id": 40,
    "name": "boAt Airdopes 212",
    "price": 899.00,
    "website": "FLIPKART"
  },
  "comparisons": [
    { "website": "AMAZON", "price": 999.00, "difference": 100.00 },
    { "website": "FLIPKART", "price": 899.00, "difference": 0.00 }
  ]
}`
      }
    ]
  }

  const getMethodColor = (method) => {
    switch (method) {
      case "GET": return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
      case "POST": return "bg-blue-500/10 text-blue-400 border border-blue-500/20"
      case "DELETE": return "bg-red-500/10 text-red-400 border border-red-500/20"
      default: return "bg-zinc-800 text-zinc-400"
    }
  }

  return (
    <footer className="bg-black border-t border-white/5 px-8 py-16 relative z-10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Brand Column */}
          <div className="md:col-span-2">
            <h2 className="text-3xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-4">
              PriceTracker AI
            </h2>
            <p className="text-gray-400 text-sm max-w-sm leading-relaxed mb-6">
              Empowering online shoppers with AI-driven commerce intelligence, historical trend analysis, and automated price monitoring.
            </p>
            <div className="flex gap-4">
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-zinc-500 hover:text-white transition"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                  <path d="M9 18c-4.51 2-5-2-7-2" />
                </svg>
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-zinc-500 hover:text-white transition"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect width="4" height="12" x="2" y="9" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-zinc-200 font-bold text-sm uppercase tracking-wider mb-4">Navigation</h4>
            <ul className="space-y-3">
              <li>
                <a href="#features" className="text-zinc-400 hover:text-emerald-400 text-sm transition">Features</a>
              </li>
              <li>
                <a href="#how-it-works" className="text-zinc-400 hover:text-emerald-400 text-sm transition">How it Works</a>
              </li>
              <li>
                <a href="#about" className="text-zinc-400 hover:text-emerald-400 text-sm transition">About</a>
              </li>
              <li>
                <a href="#faq" className="text-zinc-400 hover:text-emerald-400 text-sm transition">FAQ</a>
              </li>
            </ul>
          </div>

          {/* Legal / Contact */}
          <div>
            <h4 className="text-zinc-200 font-bold text-sm uppercase tracking-wider mb-4">Product Experience</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/login" className="text-zinc-400 hover:text-emerald-400 text-sm transition">Sign In</Link>
              </li>
              <li>
                <Link to="/register" className="text-zinc-400 hover:text-emerald-400 text-sm transition">Register Account</Link>
              </li>
              <li 
                className="flex items-center gap-1.5 text-zinc-400 hover:text-emerald-400 text-sm transition cursor-pointer" 
                onClick={() => setIsApiOpen(true)}
              >
                <span>API Docs</span>
                <ExternalLink size={12} className="opacity-55" />
              </li>
            </ul>
          </div>

        </div>

        <hr className="border-white/5 mb-8" />

        {/* Copy / Stats */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-zinc-500 text-xs">
          <div>
            © {new Date().getFullYear()} PriceTracker AI. All rights reserved.
          </div>
          <div className="flex items-center gap-1.5">
            <span>Built with</span>
            <span className="bg-[#111] border border-white/10 px-2 py-0.5 rounded-md text-zinc-300 font-semibold">Spring Boot 3</span>
            <span>+</span>
            <span className="bg-[#111] border border-white/10 px-2 py-0.5 rounded-md text-zinc-300 font-semibold">React 18</span>
          </div>
        </div>
      </div>

      {/* Interactive API Docs Modal */}
      {isApiOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-[#080808] border border-[#1b1b1b] rounded-3xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden shadow-2xl relative">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#1b1b1b] px-6 py-4">
              <div className="flex items-center gap-2">
                <Code className="text-emerald-400" size={20} />
                <h3 className="text-lg font-black text-white">Spring Boot REST API References</h3>
              </div>
              <button 
                onClick={() => setIsApiOpen(false)}
                className="text-zinc-500 hover:text-white transition bg-transparent border-none cursor-pointer outline-none"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body (Tab-based view) */}
            <div className="flex flex-1 overflow-hidden">
              
              {/* Sidebar Tabs */}
              <div className="w-1/4 border-r border-[#1b1b1b] bg-black/40 flex flex-col p-4 space-y-2">
                <button
                  onClick={() => setActiveTab("auth")}
                  className={`flex items-center gap-2 w-full px-4 py-2.5 rounded-xl text-left text-xs font-bold transition cursor-pointer border-none outline-none ${activeTab === "auth" ? "bg-white/5 text-white" : "text-zinc-500 hover:text-zinc-300"}`}
                >
                  <Key size={14} /> Authentication
                </button>
                <button
                  onClick={() => setActiveTab("products")}
                  className={`flex items-center gap-2 w-full px-4 py-2.5 rounded-xl text-left text-xs font-bold transition cursor-pointer border-none outline-none ${activeTab === "products" ? "bg-white/5 text-white" : "text-zinc-500 hover:text-zinc-300"}`}
                >
                  <List size={14} /> Product watchlist
                </button>
                <button
                  onClick={() => setActiveTab("stats")}
                  className={`flex items-center gap-2 w-full px-4 py-2.5 rounded-xl text-left text-xs font-bold transition cursor-pointer border-none outline-none ${activeTab === "stats" ? "bg-white/5 text-white" : "text-zinc-500 hover:text-zinc-300"}`}
                >
                  <Activity size={14} /> Global aggregates
                </button>
                <button
                  onClick={() => setActiveTab("compare")}
                  className={`flex items-center gap-2 w-full px-4 py-2.5 rounded-xl text-left text-xs font-bold transition cursor-pointer border-none outline-none ${activeTab === "compare" ? "bg-white/5 text-white" : "text-zinc-500 hover:text-zinc-300"}`}
                >
                  <GitCompare size={14} /> Price comparison
                </button>
              </div>

              {/* Endpoints Content Panel */}
              <div className="w-3/4 p-6 overflow-y-auto space-y-8 bg-black/10">
                {apiEndpoints[activeTab].map((endpoint, index) => (
                  <div key={index} className="border-b border-[#1b1b1b]/50 pb-6 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${getMethodColor(endpoint.method)}`}>
                        {endpoint.method}
                      </span>
                      <code className="text-zinc-100 font-mono text-sm font-bold bg-white/5 px-2 py-0.5 rounded">{endpoint.path}</code>
                    </div>

                    <p className="text-zinc-400 text-[13px] mb-4 font-semibold">{endpoint.desc}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Request block */}
                      <div>
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-1">Request Payload</span>
                        <pre className="bg-zinc-950 border border-[#1b1b1b] rounded-xl p-3 text-emerald-400 font-mono text-xs overflow-x-auto max-h-[180px]">
                          {endpoint.request}
                        </pre>
                      </div>
                      {/* Response block */}
                      <div>
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-1">JSON Response</span>
                        <pre className="bg-zinc-950 border border-[#1b1b1b] rounded-xl p-3 text-cyan-400 font-mono text-xs overflow-x-auto max-h-[180px]">
                          {endpoint.response}
                        </pre>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>

            {/* Modal Footer */}
            <div className="border-t border-[#1b1b1b] px-6 py-4 flex justify-between items-center bg-zinc-950/40">
              <span className="text-zinc-500 text-[10px] font-bold">PriceTracker RESTful Swagger Blueprint</span>
              <button 
                onClick={() => setIsApiOpen(false)}
                className="bg-white/5 hover:bg-white/10 text-white font-bold px-4 py-1.5 rounded-xl text-xs transition border-none cursor-pointer outline-none"
              >
                Close Documentation
              </button>
            </div>

          </div>
        </div>
      )}

    </footer>
  )
}
