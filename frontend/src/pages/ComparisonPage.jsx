import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  Bell,
  History,
  LogOut,
  GitCompare,
  Plus,
  Trash2,
  RefreshCw,
  ExternalLink,
  Award,
  TrendingDown,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Settings
} from "lucide-react";
import { useToast } from "../context/ToastContext";
import {
  createComparisonGroup,
  getComparisonGroups,
  getGroupComparisonResult,
  deleteComparisonGroup,
  refreshComparisonGroupPrices,
  trackProduct
} from "../services/productService";

export default function ComparisonPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshingId, setRefreshingId] = useState(null);

  // Form states
  const [groupName, setGroupName] = useState("");
  const [urls, setUrls] = useState(["", ""]);

  // Comparison result state
  const [activeComparison, setActiveComparison] = useState(null);

  // Saved comparisons state
  const [savedGroups, setSavedGroups] = useState([]);
  const [expandedGroupId, setExpandedGroupId] = useState(null);
  const [expandedComparisonData, setExpandedComparisonData] = useState({});
  const [expandedLoading, setExpandedLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }
    setUserName(localStorage.getItem("name") || "");
    loadSavedGroups();

    // Check if redirect contains prefilled URL
    const queryParams = new URLSearchParams(location.search);
    const prefillUrl = queryParams.get("prefillUrl");
    const prefillName = queryParams.get("prefillName");
    if (prefillUrl) {
      setUrls([prefillUrl, ""]);
      if (prefillName) {
        setGroupName(prefillName);
      }
    }
  }, [location.search]);

  const loadSavedGroups = async () => {
    try {
      const data = await getComparisonGroups();
      setSavedGroups(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load saved groups:", err);
      setSavedGroups([]);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  const detectPlatform = (url) => {
    if (!url) return null;
    const lower = url.toLowerCase();
    if (lower.contains("amazon.in") || lower.contains("amazon.com") || lower.contains("amzn.in") || lower.contains("amzn.to")) {
      return "AMAZON";
    }
    if (lower.contains("flipkart.com")) {
      return "FLIPKART";
    }
    if (lower.contains("myntra.com")) {
      return "MYNTRA";
    }
    if (lower.contains("ajio.com")) {
      return "AJIO";
    }
    return null;
  };

  // String helper for JavaScript ES5 backward compatibility
  String.prototype.contains = function (str) {
    return this.indexOf(str) !== -1;
  };

  const getPlatformStyle = (platform) => {
    switch (platform) {
      case "AMAZON":
        return "bg-amber-500/10 text-amber-500 border border-amber-500/20";
      case "FLIPKART":
        return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
      case "MYNTRA":
        return "bg-pink-500/10 text-pink-400 border border-pink-500/20";
      case "AJIO":
        return "bg-red-500/10 text-red-400 border border-red-500/20";
      default:
        return "bg-zinc-800 text-zinc-400 border border-zinc-700/50";
    }
  };

  const handleAddUrlRow = () => {
    if (urls.length >= 4) {
      showToast("You can compare up to 4 platforms side-by-side.", "warning");
      return;
    }
    setUrls([...urls, ""]);
  };

  const handleRemoveUrlRow = (index) => {
    if (urls.length <= 2) {
      showToast("You need at least 2 URLs to perform a comparison.", "warning");
      return;
    }
    const copy = [...urls];
    copy.splice(index, 1);
    setUrls(copy);
  };

  const handleUrlChange = (index, value) => {
    const copy = [...urls];
    copy[index] = value;
    setUrls(copy);
  };

  const handleCompare = async () => {
    if (!groupName.trim()) {
      showToast("Please enter a comparison group name.", "error");
      return;
    }

    const filledUrls = urls.filter((u) => u.trim());
    if (filledUrls.length < 2) {
      showToast("Please enter at least 2 product URLs.", "error");
      return;
    }

    // Validation platforms distinct
    const platforms = [];
    for (const url of filledUrls) {
      const plat = detectPlatform(url);
      if (!plat) {
        showToast(`Unsupported e-commerce platform for URL: ${url.substring(0, 40)}...`, "error");
        return;
      }
      if (platforms.includes(plat)) {
        showToast(`Duplicate platform detected: ${plat}. Please compare distinct e-commerce platforms.`, "error");
        return;
      }
      platforms.push(plat);
    }

    setLoading(true);
    try {
      const group = await createComparisonGroup(groupName, filledUrls);
      showToast("Comparison created successfully! 📊", "success");
      
      // Load results for the newly created group
      const results = await getGroupComparisonResult(group.id);
      setActiveComparison(results);
      setGroupName("");
      setUrls(["", ""]);
      loadSavedGroups();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || err.message || "Scraping comparison failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleExpandGroup = async (groupId) => {
    if (expandedGroupId === groupId) {
      setExpandedGroupId(null);
      return;
    }

    setExpandedGroupId(groupId);
    setExpandedLoading(true);
    try {
      const results = await getGroupComparisonResult(groupId);
      setExpandedComparisonData({
        ...expandedComparisonData,
        [groupId]: results
      });
    } catch (err) {
      console.error(err);
      showToast("Failed to fetch comparison details.", "error");
      setExpandedGroupId(null);
    } finally {
      setExpandedLoading(false);
    }
  };

  const handleRefreshPrices = async (groupId) => {
    setRefreshingId(groupId);
    try {
      const results = await refreshComparisonGroupPrices(groupId);
      setExpandedComparisonData({
        ...expandedComparisonData,
        [groupId]: results
      });
      if (activeComparison && activeComparison.groupId === groupId) {
        setActiveComparison(results);
      }
      showToast("Latest prices re-fetched successfully! 🔄", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to refresh comparison prices.", "error");
    } finally {
      setRefreshingId(null);
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (!window.confirm("Are you sure you want to delete this comparison group? Linked products will remain tracked in your watchlist.")) {
      return;
    }

    try {
      await deleteComparisonGroup(groupId);
      showToast("Comparison group deleted.", "info");
      if (activeComparison && activeComparison.groupId === groupId) {
        setActiveComparison(null);
      }
      setSavedGroups(savedGroups.filter((g) => g.id !== groupId));
    } catch (err) {
      console.error(err);
      showToast("Failed to delete group.", "error");
    }
  };

  const handleTrackThisProduct = async (url, targetPrice) => {
    try {
      await trackProduct(url, targetPrice, "EMAIL");
      showToast("Product locked into your active watchlist! 🚀", "success");
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || err.message || "Failed to track product.", "error");
    }
  };

  const formatPrice = (priceVal) => {
    if (priceVal === null || priceVal === undefined) return "₹0";
    return Number(priceVal).toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    });
  };

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Sidebar */}
      <div className="w-[280px] bg-[#040404] border-r border-[#161616] flex flex-col justify-between px-7 py-8 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-black mb-10 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            PriceTracker AI
          </h1>
          <div className="space-y-3">
            <SidebarButton
              icon={<LayoutDashboard size={22} />}
              name="Dashboard"
              onClick={() => navigate("/dashboard?section=dashboard")}
            />
            <SidebarButton
              icon={<Package size={22} />}
              name="Products"
              onClick={() => navigate("/dashboard?section=products")}
            />
            <SidebarButton
              icon={<Bell size={22} />}
              name="Alerts"
              onClick={() => navigate("/dashboard?section=alerts")}
            />
            <SidebarButton
              icon={<History size={22} />}
              name="History"
              onClick={() => navigate("/dashboard?section=history")}
            />
            <SidebarButton
              icon={<GitCompare size={22} />}
              name="Compare"
              active={true}
              onClick={() => navigate("/compare")}
            />
            <SidebarButton
              icon={<Settings size={22} />}
              name="Settings"
              onClick={() => navigate("/dashboard?section=settings")}
            />
          </div>
        </div>
        <motion.button
          onClick={handleLogout}
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-3 text-red-400 hover:text-red-300 transition bg-transparent border-none cursor-pointer font-medium"
        >
          <LogOut size={20} />
          Logout
        </motion.button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 px-10 py-8 overflow-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-black leading-none">Compare Prices 📊</h1>
          <p className="text-gray-400 mt-2 text-lg">
            Add identical products from distinct stores to filter out the cheapest option.
          </p>
        </div>

        {/* Section 1: Create New Comparison */}
        <div className="bg-[#060606] border border-[#171717] rounded-3xl p-6 mb-8 shadow-lg shadow-emerald-500/5">
          <h2 className="text-3xl font-black mb-5">Create New Comparison</h2>
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-zinc-400 text-sm font-semibold">Comparison Title / Group Name</label>
              <input
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="e.g. Sony WH-1000XM5 Headphones"
                className="bg-black border border-[#242424] rounded-2xl px-5 py-4 outline-none focus:border-emerald-500 transition text-zinc-300 w-full"
              />
            </div>

            <div className="space-y-3">
              <label className="text-zinc-400 text-sm font-semibold">Product Store URLs</label>
              {urls.map((url, index) => {
                const platform = detectPlatform(url);
                return (
                  <div key={index} className="flex gap-3 items-center">
                    <div className="flex-1 relative">
                      <input
                        value={url}
                        onChange={(e) => handleUrlChange(index, e.target.value)}
                        placeholder={`Platform URL ${index + 1} (Amazon, Flipkart, Myntra, or Ajio)...`}
                        className="bg-black border border-[#242424] rounded-2xl pl-5 pr-28 py-4 outline-none focus:border-emerald-500 transition text-zinc-300 w-full text-sm"
                      />
                      {platform && (
                        <div className={`absolute right-4 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${getPlatformStyle(platform)}`}>
                          {platform}
                        </div>
                      )}
                    </div>
                    {urls.length > 2 && (
                      <button
                        onClick={() => handleRemoveUrlRow(index)}
                        className="bg-red-950/20 border border-red-900/30 text-red-400 hover:text-red-300 p-3.5 rounded-xl cursor-pointer transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-center mt-6">
              <button
                onClick={handleAddUrlRow}
                className="flex items-center gap-2 bg-[#091a14] border border-[#164d36] text-emerald-400 hover:text-emerald-300 font-bold px-5 py-3 rounded-2xl cursor-pointer transition text-sm"
              >
                <Plus size={16} />
                Add Another Platform
              </button>

              <motion.button
                disabled={loading}
                onClick={handleCompare}
                whileHover={{ scale: 1.02, boxShadow: "0px 0px 25px rgba(16,185,129,0.45)" }}
                whileTap={{ scale: 0.98 }}
                className="bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold px-8 py-4 rounded-2xl transition shadow-lg disabled:opacity-50 cursor-pointer"
              >
                {loading ? "Fetching prices from all platforms..." : "Compare Now"}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Section 2: Comparison Result */}
        <AnimatePresence>
          {activeComparison && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-[#060606] border border-emerald-500/20 rounded-3xl p-6 mb-8 shadow-lg shadow-emerald-500/5"
            >
              <div className="flex justify-between items-start mb-6 border-b border-[#1f1f1f] pb-4">
                <div>
                  <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                    Comparison Active
                  </span>
                  <h2 className="text-3xl font-black mt-2 text-zinc-100">{activeComparison.groupName}</h2>
                </div>
                {activeComparison.totalSavingsVsBest > 0 && (
                  <div className="bg-emerald-950/40 border border-emerald-900/50 text-emerald-400 px-4 py-2.5 rounded-2xl text-right">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase block">Max Savings</span>
                    <span className="font-black text-lg">Save up to {formatPrice(activeComparison.totalSavingsVsBest)}</span>
                  </div>
                )}
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {activeComparison.items.map((item) => (
                  <ComparisonCard
                    key={item.productId}
                    item={item}
                    onTrack={handleTrackThisProduct}
                    getStyle={getPlatformStyle}
                    formatPrice={formatPrice}
                  />
                ))}
              </div>

              <div className="flex justify-between items-center text-xs text-zinc-500 font-bold mt-6 pt-4 border-t border-[#121212]">
                <span>Best Deal: {activeComparison.bestDealPlatform}</span>
                <span>Last Updated: {new Date(activeComparison.lastUpdatedAt).toLocaleString("en-IN")}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Section 3: Saved Comparisons */}
        <div className="bg-[#060606] border border-[#171717] rounded-3xl p-6 shadow-lg shadow-emerald-500/5">
          <h2 className="text-3xl font-black mb-5">Saved Comparisons</h2>
          {savedGroups.length === 0 ? (
            <div className="text-zinc-500 text-center py-12 text-lg">
              No saved comparison groups. Create one above to compare.
            </div>
          ) : (
            <div className="space-y-4">
              {savedGroups.map((group) => {
                const isExpanded = expandedGroupId === group.id;
                const details = expandedComparisonData[group.id];

                return (
                  <div key={group.id} className="bg-black border border-[#222] rounded-3xl overflow-hidden hover:border-[#333] transition">
                    <div
                      onClick={() => handleToggleExpandGroup(group.id)}
                      className="p-5 flex justify-between items-center cursor-pointer hover:bg-white/[0.01] transition"
                    >
                      <div>
                        <h3 className="font-bold text-lg text-zinc-200">{group.groupName}</h3>
                        <p className="text-xs text-zinc-500 mt-1">
                          Platforms: {group.productCount} • Created {new Date(group.createdAt).toLocaleDateString("en-IN")}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRefreshPrices(group.id);
                          }}
                          disabled={refreshingId === group.id}
                          className="bg-[#0c0c0c] border border-[#222] hover:border-emerald-500/30 text-zinc-400 hover:text-emerald-400 p-2.5 rounded-xl transition cursor-pointer"
                        >
                          <RefreshCw size={16} className={refreshingId === group.id ? "animate-spin" : ""} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteGroup(group.id);
                          }}
                          className="bg-red-950/20 border border-red-900/30 text-red-400 hover:text-red-300 p-2.5 rounded-xl transition cursor-pointer"
                        >
                          <Trash2 size={16} />
                        </button>
                        <div className="text-zinc-500">
                          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: "auto" }}
                          exit={{ height: 0 }}
                          className="border-t border-[#1a1a1a] overflow-hidden"
                        >
                          <div className="p-6 bg-[#040404]">
                            {expandedLoading && !details ? (
                              <div className="text-center py-8 text-zinc-500 flex items-center justify-center gap-3">
                                <RefreshCw className="animate-spin text-emerald-400" />
                                Loading side-by-side details...
                              </div>
                            ) : details ? (
                              <div>
                                {details.totalSavingsVsBest > 0 && (
                                  <div className="mb-4 bg-emerald-950/20 border border-emerald-900/30 text-emerald-400 px-4 py-2 rounded-xl text-xs font-bold w-fit">
                                    💡 You save {formatPrice(details.totalSavingsVsBest)} with {details.bestDealPlatform} compared to the most expensive platform!
                                  </div>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                                  {details.items.map((item) => (
                                    <ComparisonCard
                                      key={item.productId}
                                      item={item}
                                      onTrack={handleTrackThisProduct}
                                      getStyle={getPlatformStyle}
                                      formatPrice={formatPrice}
                                    />
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <div className="text-red-400 text-center py-4">Failed to load comparison data.</div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SidebarButton({ icon, name, active = false, onClick }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
      className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-left transition-all duration-200 cursor-pointer ${active ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold" : "text-zinc-400 hover:text-zinc-100 hover:bg-white/5 border border-transparent"}`}
    >
      {icon}
      {name}
    </motion.button>
  );
}

function ComparisonCard({ item, onTrack, getStyle, formatPrice }) {
  return (
    <div
      className={`bg-black border rounded-2xl overflow-hidden flex flex-col justify-between transition duration-300 relative ${item.isBestDeal ? "border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.15)] scale-[1.01]" : "border-[#1c1c1c] hover:border-[#333]"}`}
    >
      {item.isBestDeal && (
        <div className="bg-emerald-500 text-black font-black text-[10px] tracking-widest uppercase py-1 text-center w-full shadow-md flex items-center justify-center gap-1">
          <Award size={12} />
          Best Deal
        </div>
      )}

      <div className="p-5 flex-grow flex flex-col justify-between">
        <div>
          {/* Platform Badge */}
          <div className="flex justify-between items-start mb-4">
            <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md ${getStyle(item.platform)}`}>
              {item.platform}
            </span>
            {item.availability && (
              <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full ${item.availability.toLowerCase().contains("out") || item.availability.toLowerCase().contains("unavail") ? "bg-red-950/40 text-red-400 border border-red-900/30" : "bg-emerald-950/40 text-emerald-400 border border-emerald-900/30"}`}>
                {item.availability}
              </span>
            )}
          </div>

          {/* Product Image */}
          <div className="h-32 w-full bg-white border border-[#1a1a1a] rounded-xl flex items-center justify-center overflow-hidden mb-4 p-2">
            {item.imageUrl ? (
              <img src={item.imageUrl} alt={item.productName} className="h-full w-full object-contain" />
            ) : (
              <span className="text-zinc-400 text-2xl font-bold">{item.platform.charAt(0)}</span>
            )}
          </div>

          {/* Product Name */}
          <h4 className="text-zinc-200 font-bold text-xs line-clamp-2 leading-relaxed mb-3 min-h-[2.5rem]">
            {item.productName}
          </h4>

          {/* Rating */}
          {item.rating && item.rating !== "N/A" && (
            <div className="text-yellow-500 text-[10px] font-extrabold mb-3 flex items-center gap-1">
              ⭐ <span className="text-zinc-400">{item.rating}</span>
            </div>
          )}
        </div>

        <div>
          {/* Price Layout */}
          <div className="mt-2 border-t border-[#121212] pt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-zinc-100 font-black text-xl">{formatPrice(item.currentPrice)}</span>
              {item.originalPrice && item.originalPrice > item.currentPrice && (
                <span className="text-zinc-500 line-through text-xs">{formatPrice(item.originalPrice)}</span>
              )}
            </div>
            {item.discountPercent && item.discountPercent > 0 ? (
              <div className="text-[10px] text-emerald-400 font-black mt-1 uppercase tracking-wider">
                🔥 Save {item.discountPercent.toFixed(0)}% (Best ever: {formatPrice(item.lowestEverPrice)})
              </div>
            ) : (
              <div className="text-[9px] text-zinc-500 font-bold mt-1 uppercase">
                All-time low: {formatPrice(item.lowestEverPrice)}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2 mt-4">
            <a
              href={item.productUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-zinc-900 hover:bg-zinc-800 border border-[#222] hover:border-[#333] text-zinc-200 font-bold px-3 py-2 rounded-xl text-[10px] text-center flex items-center justify-center gap-1 transition"
            >
              Go to Store
              <ExternalLink size={10} />
            </a>
            <button
              onClick={() => onTrack(item.productUrl, item.currentPrice)}
              className="bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold px-3 py-2 rounded-xl text-[10px] cursor-pointer transition text-center"
            >
              Track This
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
