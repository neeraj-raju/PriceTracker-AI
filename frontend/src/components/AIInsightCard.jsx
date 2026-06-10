import React, { useEffect, useState } from "react";
import { getAIInsight } from "../services/productService";
import { motion } from "framer-motion";
import { Brain, Clock, HelpCircle, TrendingDown, ArrowUpRight, Award, Eye } from "lucide-react";

export default function AIInsightCard({ productId, productName }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInsight = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAIInsight(productId);
      setReport(data);
    } catch (err) {
      console.error("Error fetching AI insight:", err);
      setError("Failed to load AI price intelligence report.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchInsight();
    }
  }, [productId]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });
  };

  const formatPrice = (priceVal) => {
    if (priceVal === null || priceVal === undefined) return "₹0";
    return Number(priceVal).toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    });
  };

  // 1. Loading State (Pulsing Skeleton Card)
  if (loading) {
    return (
      <div className="w-full bg-[#060606] border border-[#171717] rounded-3xl p-6 mt-8 animate-pulse">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-[#1f1f1f] rounded-xl" />
            <div className="h-6 w-48 bg-[#1f1f1f] rounded-lg" />
          </div>
          <div className="h-8 w-24 bg-[#1f1f1f] rounded-full" />
        </div>
        <div className="h-4 w-full bg-[#1f1f1f] rounded-md mb-3" />
        <div className="h-4 w-5/6 bg-[#1f1f1f] rounded-md mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-[#0c0c0c] border border-[#171717] rounded-2xl" />
          ))}
        </div>
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-[#121212]">
          <div className="h-4 w-40 bg-[#1f1f1f] rounded-md" />
        </div>
      </div>
    );
  }

  // 2. Error State
  if (error) {
    return (
      <div className="w-full bg-[#0a0505] border border-red-500/20 rounded-3xl p-6 mt-8 flex items-center gap-4 text-red-400">
        <HelpCircle className="h-8 w-8 flex-shrink-0" />
        <div>
          <h4 className="font-bold text-lg">Analysis Unavailable</h4>
          <p className="text-sm opacity-80">{error}</p>
        </div>
      </div>
    );
  }

  if (!report) return null;

  // 3. Insufficient Data State
  if (report.status === "INSUFFICIENT_DATA") {
    return (
      <div className="w-full bg-[#05111a] border border-cyan-500/20 rounded-3xl p-6 mt-8 flex items-start gap-4 text-cyan-400 shadow-lg shadow-cyan-500/5">
        <Clock className="h-6 w-6 mt-1 flex-shrink-0" />
        <div>
          <h4 className="font-extrabold text-lg flex items-center gap-2">
            🧠 AI Price Intelligence
            <span className="bg-cyan-950 text-cyan-400 border border-cyan-900/50 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
              Analyzing
            </span>
          </h4>
          <p className="text-zinc-400 text-sm mt-2 leading-relaxed">
            {report.insightText || "We need a few more days of data to generate insights. Check back soon."}
          </p>
        </div>
      </div>
    );
  }

  // 4. Recommendation Badge Config
  let badgeConfig = {
    text: "Monitor",
    colorClass: "bg-zinc-900 text-zinc-400 border border-zinc-700/50",
    icon: <Eye className="h-4 w-4" />
  };

  if (report.recommendation === "BUY_NOW") {
    badgeConfig = {
      text: "Buy Now",
      colorClass: "bg-emerald-950/80 text-emerald-400 border border-emerald-500/30",
      icon: <Award className="h-4 w-4" />
    };
  } else if (report.recommendation === "GOOD_DEAL") {
    badgeConfig = {
      text: "Good Deal",
      colorClass: "bg-blue-950/80 text-blue-400 border border-blue-500/30",
      icon: <TrendingDown className="h-4 w-4" />
    };
  } else if (report.recommendation === "WAIT") {
    badgeConfig = {
      text: "Wait",
      colorClass: "bg-amber-950/80 text-amber-400 border border-amber-500/30",
      icon: <Clock className="h-4 w-4" />
    };
  }

  // 5. Ready State
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full bg-[#060606] border border-[#171717] hover:border-emerald-500/20 rounded-3xl mt-8 overflow-hidden shadow-lg shadow-emerald-500/5"
    >
      {/* Header with teal gradient background */}
      <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-black border-b border-[#1f1f1f] px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-2 rounded-xl flex-shrink-0">
            <Brain className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-zinc-100 flex items-center gap-2">
              🧠 AI Price Intelligence
            </h3>
            <p className="text-zinc-500 text-xs mt-0.5">Statistical price volatility & buying helper</p>
          </div>
        </div>

        {/* Recommendation badge */}
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${badgeConfig.colorClass}`}>
          {badgeConfig.icon}
          {badgeConfig.text}
        </div>
      </div>

      {/* Insight Text */}
      <div className="px-6 py-5">
        <p className="text-zinc-300 text-sm leading-relaxed mb-6 font-medium">
          {report.insightText}
        </p>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#0c0c0c] border border-[#1f1f1f] p-4 rounded-2xl flex flex-col justify-between">
            <span className="text-[10px] text-zinc-500 font-bold uppercase block">Lowest Ever</span>
            <span className="text-emerald-400 font-extrabold text-base mt-1.5">
              {formatPrice(report.lowestPrice)}
            </span>
          </div>

          <div className="bg-[#0c0c0c] border border-[#1f1f1f] p-4 rounded-2xl flex flex-col justify-between">
            <span className="text-[10px] text-zinc-500 font-bold uppercase block">Highest Ever</span>
            <span className="text-red-400 font-extrabold text-base mt-1.5">
              {formatPrice(report.highestPrice)}
            </span>
          </div>

          <div className="bg-[#0c0c0c] border border-[#1f1f1f] p-4 rounded-2xl flex flex-col justify-between">
            <span className="text-[10px] text-zinc-500 font-bold uppercase block">Avg Price</span>
            <span className="text-zinc-200 font-extrabold text-base mt-1.5">
              {formatPrice(report.averagePrice)}
            </span>
          </div>

          <div className="bg-[#0c0c0c] border border-[#1f1f1f] p-4 rounded-2xl flex flex-col justify-between">
            <span className="text-[10px] text-zinc-500 font-bold uppercase block">Days Tracked</span>
            <span className="text-cyan-400 font-extrabold text-base mt-1.5">
              {report.daysTracked} {report.daysTracked === 1 ? "day" : "days"}
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-[#030303] border-t border-[#121212] px-6 py-3.5 flex justify-between items-center text-[11px] text-zinc-500 font-bold">
        <span>Volatility: {report.priceVolatility ? report.priceVolatility.toFixed(2) : "0.00"}</span>
        <span>Last analyzed: {formatDate(report.generatedAt)}</span>
      </div>
    </motion.div>
  );
}
