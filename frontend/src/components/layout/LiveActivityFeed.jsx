import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

export default function LiveActivityFeed() {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFeed = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/stats/live-feed");
      setFeed(response.data || []);
    } catch (err) {
      console.error("Failed to load live activity feed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
    const interval = setInterval(fetchFeed, 60000);
    return () => clearInterval(interval);
  }, []);

  const getPlatformStyle = (platform, colorHex) => {
    return {
      backgroundColor: colorHex + "15",
      color: colorHex,
      borderColor: colorHex + "30",
    };
  };

  // Count events logged "today"
  const getTodayEventsCount = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return feed.filter((item) => {
      if (!item.createdAt) return false;
      const itemDate = new Date(item.createdAt);
      return itemDate >= today;
    }).length;
  };

  if (loading) {
    return (
      <div className="w-full bg-zinc-950/60 rounded-2xl p-5 border border-white/5 animate-pulse min-h-[220px] flex flex-col justify-between">
        <div className="flex justify-between items-center pb-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-zinc-700"></div>
            <div className="h-4 w-32 bg-zinc-800 rounded"></div>
          </div>
          <div className="h-4 w-20 bg-zinc-800 rounded"></div>
        </div>
        <div className="space-y-4 py-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-3/4">
                <div className="w-6 h-6 bg-zinc-800 rounded-full"></div>
                <div className="h-4 w-full bg-zinc-800 rounded"></div>
              </div>
              <div className="h-4 w-12 bg-zinc-800 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const activeFeedItems = feed.slice(0, 4);
  const eventsCount = getTodayEventsCount();

  return (
    <div className="w-full bg-zinc-950/60 rounded-2xl p-5 border border-white/[0.08] relative z-10 shadow-md">
      {/* Header Row */}
      <div className="flex justify-between items-center pb-4 border-b border-white/5 mb-2">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <span className="text-red-500 font-extrabold text-xs tracking-widest uppercase">
            Live
          </span>
          <span className="text-zinc-400 font-bold text-sm">
            Global Price Activity Feed
          </span>
        </div>
        <span className="text-zinc-500 font-bold text-xs">
          {eventsCount} global events today
        </span>
      </div>

      {/* Feed List */}
      {feed.length === 0 ? (
        <div className="flex items-center justify-center py-10 text-center">
          <p className="text-zinc-500 text-sm italic">
            👁 System is actively monitoring prices. Activity will appear here as prices change.
          </p>
        </div>
      ) : (
        <div className="flex flex-col">
          <AnimatePresence initial={false}>
            {activeFeedItems.map((item, index) => {
              const platformStyle = getPlatformStyle(item.platform, item.colorHex);
              const isLast = index === activeFeedItems.length - 1;

              return (
                <motion.div
                  key={item.createdAt + "-" + item.message}
                  initial={{ opacity: 0, y: -12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className={`flex items-center justify-between gap-4 py-3.5 ${
                    !isLast ? "border-b border-white/5" : ""
                  }`}
                >
                  {/* Left: Icon + Message */}
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-lg flex-shrink-0 select-none">{item.icon}</span>
                    <span className="text-white text-xs font-semibold truncate">
                      {item.message}
                    </span>
                    <span
                      style={platformStyle}
                      className="px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border flex-shrink-0"
                    >
                      {item.platform}
                    </span>
                  </div>

                  {/* Right: Time Ago */}
                  <span className="text-zinc-500 text-[10px] font-bold flex-shrink-0">
                    {item.timeAgo}
                  </span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
