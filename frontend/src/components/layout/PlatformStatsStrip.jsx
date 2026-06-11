import React, { useState, useEffect } from "react";
import axios from "axios";
import { ArrowRight, TrendingUp, TrendingDown, Eye, Activity, Sparkles, ShoppingBag, Zap, Percent } from "lucide-react";

// Count-up hook utilizing requestAnimationFrame for smooth animations
function useCountUp(targetValue, duration = 1200) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (targetValue === undefined || targetValue === null || isNaN(targetValue)) {
      return;
    }
    if (targetValue === 0) {
      setCount(0);
      return;
    }

    let start = 0;
    const end = parseInt(targetValue, 10);
    let startTimestamp = null;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * (end - start) + start));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCount(end);
      }
    };

    window.requestAnimationFrame(step);
  }, [targetValue, duration]);

  return count;
}

export default function PlatformStatsStrip() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/stats/platform-summary");
        setStats(response.data || []);
      } catch (err) {
        console.error("Failed to load platform stats summary:", err);
        setStats([]);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleStatClick = (platform) => {
    const trackInput = document.querySelector("input[placeholder*='link']") ||
                       document.querySelector("input[placeholder*='Paste Amazon']") ||
                       document.querySelector("form input");
    if (trackInput) {
      trackInput.scrollIntoView({ behavior: "smooth", block: "center" });
      trackInput.focus();
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 w-full">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-zinc-950/60 border border-white/5 rounded-3xl p-5 h-[200px] animate-pulse flex flex-col justify-between"
          >
            <div className="flex justify-between items-center">
              <div className="h-4 w-20 bg-zinc-800 rounded-lg"></div>
              <div className="h-4 w-12 bg-zinc-800 rounded-full"></div>
            </div>
            <div className="space-y-3">
              <div className="h-10 w-16 bg-zinc-800 rounded-lg"></div>
              <div className="h-3 w-32 bg-zinc-800 rounded-md"></div>
            </div>
            <div className="h-8 w-full bg-zinc-800 rounded-xl"></div>
          </div>
        ))}
      </div>
    );
  }

  const displayStats = stats.length > 0 ? stats : [
    { platform: "AMAZON", displayName: "Amazon", colorHex: "#FF9900", totalTracked: 0, dropsThisWeek: 0, averageSaving: 0.0, trend: "STABLE" },
    { platform: "FLIPKART", displayName: "Flipkart", colorHex: "#2874F0", totalTracked: 0, dropsThisWeek: 0, averageSaving: 0.0, trend: "STABLE" },
    { platform: "MYNTRA", displayName: "Myntra", colorHex: "#FF3F6C", totalTracked: 0, dropsThisWeek: 0, averageSaving: 0.0, trend: "STABLE" },
    { platform: "AJIO", displayName: "Ajio", colorHex: "#EF4056", totalTracked: 0, dropsThisWeek: 0, averageSaving: 0.0, trend: "STABLE" }
  ];

  return (
    <div className="w-full relative z-10 space-y-4">
      {/* Title Header with Tech Aesthetic */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-left">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span className="text-emerald-400"><Activity size={20} className="animate-pulse" /></span>
            Platform Status Intelligence
          </h2>
          <p className="text-[11px] md:text-xs text-zinc-400 font-semibold mt-0.5">
            Real-time price drop analytics and active watchlists tracked globally across all registered users.
          </p>
        </div>
        <div className="flex items-center gap-1.5 self-start md:self-center bg-zinc-950/80 border border-white/5 px-3 py-1 rounded-full text-[10px] font-bold text-zinc-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
          Live Stream Active
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full">
        {displayStats.map((item) => (
          <PlatformCard
            key={item.platform}
            item={item}
            formatCurrency={formatCurrency}
            onClick={() => handleStatClick(item.platform)}
          />
        ))}
      </div>
    </div>
  );
}

function PlatformCard({ item, formatCurrency, onClick }) {
  const [hovered, setHovered] = useState(false);
  const animatedTracked = useCountUp(item.totalTracked);
  const animatedDrops = useCountUp(item.dropsThisWeek);

  const shadowStyle = hovered 
    ? { 
        boxShadow: `0 20px 40px -15px ${item.colorHex}25`,
        borderColor: `${item.colorHex}30`
      } 
    : {
        borderColor: "rgba(255, 255, 255, 0.05)"
      };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={shadowStyle}
      className="bg-zinc-950/50 backdrop-blur-2xl border rounded-3xl p-5 flex flex-col justify-between transition-all duration-500 hover:scale-[1.03] relative overflow-hidden group shadow-xl shadow-black/80 cursor-pointer h-[215px]"
      onClick={onClick}
    >
      {/* 2px glowing top accent line */}
      <div 
        className="absolute top-0 left-0 right-0 h-[3px] transition-all duration-500 opacity-60 group-hover:opacity-100"
        style={{
          background: `linear-gradient(90deg, transparent, ${item.colorHex}, transparent)`,
          boxShadow: hovered ? `0 0 10px ${item.colorHex}` : "none"
        }}
      />

      {/* Sweeping hover shine effect */}
      <div 
        className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/[0.02] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none"
      />

      {/* Pulsing back glow */}
      <div 
        className="absolute -right-8 -top-8 w-24 h-24 rounded-full blur-3xl transition-all duration-700 opacity-10 group-hover:opacity-30 pointer-events-none"
        style={{ 
          backgroundColor: item.colorHex,
          transform: hovered ? "translate(-15px, 15px) scale(1.5)" : "none"
        }}
      />

      {/* Row 1: Header */}
      <div className="flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <span
            style={{ 
              backgroundColor: item.colorHex, 
              boxShadow: `0 0 10px ${item.colorHex}` 
            }}
            className="w-1.5 h-1.5 rounded-full inline-block animate-pulse"
          ></span>
          <span className="font-extrabold text-white text-[11px] tracking-wider uppercase">{item.displayName}</span>
        </div>
        {item.trend === "UP" ? (
          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[8px] font-black px-2 py-0.5 rounded-full flex items-center gap-0.5 uppercase tracking-wider">
            <TrendingDown size={8} className="rotate-180" />
            Active Drops
          </span>
        ) : (
          <span className="bg-zinc-800/60 text-zinc-400 border border-zinc-700/30 text-[8px] font-black px-2 py-0.5 rounded-full flex items-center gap-0.5 uppercase tracking-wider">
            Stable
          </span>
        )}
      </div>

      {/* Row 2: Main Price Drops Count */}
      <div className="my-3 z-10 flex items-baseline gap-2">
        <div className="flex flex-col">
          <div className="flex items-baseline gap-1.5">
            <span 
              className="text-3xl md:text-4xl font-black text-white leading-none tracking-tight transition-all duration-300"
              style={{ textShadow: hovered ? `0 0 15px ${item.colorHex}60` : "none" }}
            >
              {animatedDrops}
            </span>
            <span className="text-emerald-400 text-xs font-black">📉</span>
          </div>
          <p className="text-zinc-500 text-[9px] uppercase font-bold tracking-wider mt-1.5 flex items-center gap-1">
            <Zap size={10} style={{ color: item.colorHex }} />
            price drops sent
          </p>
        </div>
      </div>

      {/* Row 3: High-Tech Info Dashboard */}
      <div className="grid grid-cols-2 gap-2.5 text-[10px] font-bold border-t border-white/5 pt-3 mb-3 z-10">
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-2 flex flex-col justify-center transition group-hover:bg-white/[0.04]">
          <span className="text-zinc-500 text-[8px] uppercase tracking-wider flex items-center gap-1">
            <Eye size={9} /> Monitored
          </span>
          <span className="text-zinc-200 font-extrabold text-[11px] mt-0.5">📦 {animatedTracked} items</span>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-2 flex flex-col justify-center transition group-hover:bg-white/[0.04]">
          <span className="text-zinc-500 text-[8px] uppercase tracking-wider">Avg. Saving</span>
          <span className="text-emerald-400 font-extrabold text-[11px] mt-0.5">{formatCurrency(item.averageSaving)}</span>
        </div>
      </div>

      {/* Row 4: Action Button */}
      <button
        style={{ 
          borderColor: hovered ? item.colorHex : "rgba(255, 255, 255, 0.05)",
          backgroundColor: hovered ? `${item.colorHex}15` : "transparent",
          color: hovered ? "#fff" : "rgba(255, 255, 255, 0.6)"
        }}
        className="flex items-center justify-center gap-1.5 py-1.5 px-3 w-full text-[9px] font-black uppercase tracking-wider rounded-xl border transition-all duration-300 cursor-pointer z-10"
      >
        Track products
        <ArrowRight size={10} className="group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
}
