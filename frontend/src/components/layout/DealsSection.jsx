import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { getPublicDeals } from "../../services/productService"
import { useToast } from "../../context/ToastContext"
import { Star, Zap, TrendingDown, ArrowUpRight, CheckCircle2 } from "lucide-react"

const LOCAL_FALLBACK_DEALS = [
  {
    id: 1,
    name: "Apple iPhone 15 Pro Max (256 GB, Natural Titanium)",
    url: "https://www.amazon.in/dp/B0CHX1W1YW",
    website: "AMAZON",
    imageUrl: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?q=80&w=400",
    originalPrice: 159900,
    basePrice: 134900,
    amplitude: 2500,
    rating: 4.6,
    reviewsCount: 15420
  },
  {
    id: 2,
    name: "Sony WH-1000XM5 Wireless ANC Headphones",
    url: "https://www.amazon.in/dp/B09XS7JWHH",
    website: "AMAZON",
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=400",
    originalPrice: 34990,
    basePrice: 26900,
    amplitude: 800,
    rating: 4.5,
    reviewsCount: 8940
  },
  {
    id: 3,
    name: "Nike Air Zoom Pegasus 40 Men's Running Shoes",
    url: "https://www.myntra.com/shoes/nike/nike-men-air-zoom-pegasus-40-running-shoes/22729262/buy",
    website: "MYNTRA",
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=400",
    originalPrice: 11995,
    basePrice: 9595,
    amplitude: 300,
    rating: 4.4,
    reviewsCount: 1250
  },
  {
    id: 4,
    name: "Puma Palermo Leather Unisex Sneakers",
    url: "https://www.ajio.com/puma-men-palermo-leather-sneakers/p/467083656_blue",
    website: "AJIO",
    imageUrl: "https://images.unsplash.com/photo-1539185441755-769473a23570?q=80&w=400",
    originalPrice: 7999,
    basePrice: 5199,
    amplitude: 200,
    rating: 4.2,
    reviewsCount: 680
  },
  {
    id: 5,
    name: "Samsung Galaxy S24 Ultra (5G, Titanium Gray, 256 GB)",
    url: "https://www.flipkart.com/samsung-galaxy-s24-ultra-5g-titanium-gray-256-gb/p/itm2b49bc52ba3d1",
    website: "FLIPKART",
    imageUrl: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=400",
    originalPrice: 139999,
    basePrice: 119999,
    amplitude: 3000,
    rating: 4.7,
    reviewsCount: 20450
  },
  {
    id: 6,
    name: "Apple iPad Air 11-inch (M2, Wi-Fi, 128 GB)",
    url: "https://www.flipkart.com/apple-ipad-air-6th-gen-128-gb-rom-11-inch-wi-fi-space-grey/p/itm1df5020163351",
    website: "FLIPKART",
    imageUrl: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=400",
    originalPrice: 59900,
    basePrice: 54900,
    amplitude: 1000,
    rating: 4.6,
    reviewsCount: 3820
  },
  {
    id: 7,
    name: "ASUS ROG Ally Ryzen Z1 Extreme Handheld",
    url: "https://www.flipkart.com/asus-rog-ally-ryzen-z1-extreme-16-gb-512-gb-ssd-windows-11-home-gaming-handheld/p/itm4b23ce8d8d348",
    website: "FLIPKART",
    imageUrl: "https://images.unsplash.com/photo-1605901309584-818e25960a8f?q=80&w=400",
    originalPrice: 69990,
    basePrice: 49990,
    amplitude: 1500,
    rating: 4.5,
    reviewsCount: 4210
  },
  {
    id: 8,
    name: "Noise ColorFit Pro 5 Smart Watch (Amoled, Bluetooth)",
    url: "https://www.amazon.in/dp/B0CHYMCGD4",
    website: "AMAZON",
    imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400",
    originalPrice: 8999,
    basePrice: 3999,
    amplitude: 250,
    rating: 4.3,
    reviewsCount: 12450
  }
];

const generateFallbackDeals = () => {
  const timeSec = Math.floor(Date.now() / 10000);
  return LOCAL_FALLBACK_DEALS.map((item, index) => {
    const sine = Math.sin((timeSec + index * 17) * 0.25);
    const currentPrice = Math.round(item.basePrice + item.amplitude * sine);
    const discountPercent = Math.round(((item.originalPrice - currentPrice) / item.originalPrice) * 100);
    return {
      ...item,
      currentPrice,
      discountPercent
    };
  });
};

export default function DealsSection() {
  const { showToast } = useToast()
  const [deals, setDeals] = useState([])
  const [prevPrices, setPrevPrices] = useState({})
  const [priceChanges, setPriceChanges] = useState({}) // product id -> 'down' | 'up' | null
  const [loading, setLoading] = useState(true)

  const containerRef = useRef(null)
  const isHoveredRef = useRef(false)
  const mouseXRef = useRef(0)
  const animationFrameIdRef = useRef(null)

  const processDealsData = (data, isPoll) => {
    if (isPoll && deals.length > 0) {
      const newPriceChanges = {}
      const newPrevPrices = {}

      data.forEach((newDeal) => {
        const oldPrice = prevPrices[newDeal.id] || newDeal.currentPrice
        newPrevPrices[newDeal.id] = newDeal.currentPrice

        if (newDeal.currentPrice < oldPrice) {
          newPriceChanges[newDeal.id] = "down"
        } else if (newDeal.currentPrice > oldPrice) {
          newPriceChanges[newDeal.id] = "up"
        }
      })

      if (Object.keys(newPriceChanges).length > 0) {
        setPriceChanges(prev => ({ ...prev, ...newPriceChanges }))
        setTimeout(() => {
          setPriceChanges(prev => {
            const updated = { ...prev }
            Object.keys(newPriceChanges).forEach(id => {
              updated[id] = null
            })
            return updated
          })
        }, 1500)
      }
      setPrevPrices(newPrevPrices)
    } else {
      const initialPrices = {}
      data.forEach(d => {
        initialPrices[d.id] = d.currentPrice
      })
      setPrevPrices(initialPrices)
    }

    setDeals(data)
    setLoading(false)
  }

  // Fetch public deals on mount & poll every 4 seconds to simulate price updates
  const fetchDeals = async (isPoll = false) => {
    try {
      const data = await getPublicDeals()
      processDealsData(data, isPoll)
    } catch (err) {
      console.warn("Failed to fetch public deals from backend, using frontend simulated fallback:", err)
      const data = generateFallbackDeals()
      processDealsData(data, isPoll)
    }
  }

  useEffect(() => {
    fetchDeals()
    const interval = setInterval(() => {
      fetchDeals(true)
    }, 4000)
    return () => clearInterval(interval)
  }, [deals, prevPrices])

  // Scroll loop and proximity mouse tracking logic
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const scrollLoop = () => {
      if (!container) return

      const singleWidth = container.scrollWidth / 3
      if (singleWidth <= 0) {
        animationFrameIdRef.current = requestAnimationFrame(scrollLoop)
        return
      }

      if (isHoveredRef.current) {
        const rect = container.getBoundingClientRect()
        // ClientX position relative to viewport
        const relativeX = mouseXRef.current - rect.left
        const containerWidth = rect.width
        const ratio = relativeX / containerWidth

        if (ratio < 0.22) {
          // Move cursor to left edge -> scrolls left faster the closer it is
          const speed = (0.22 - ratio) * 22
          container.scrollLeft -= speed
        } else if (ratio > 0.78) {
          // Move cursor to right edge -> scrolls right faster the closer it is
          const speed = (ratio - 0.78) * 22
          container.scrollLeft += speed
        }
      } else {
        // Continuous slow marquee motion when not hovering
        container.scrollLeft += 0.8
      }

      // Infinite loop wrap check
      if (container.scrollLeft >= singleWidth * 2) {
        container.scrollLeft -= singleWidth
      } else if (container.scrollLeft <= 0) {
        container.scrollLeft += singleWidth
      }

      animationFrameIdRef.current = requestAnimationFrame(scrollLoop)
    }

    // Start loop
    animationFrameIdRef.current = requestAnimationFrame(scrollLoop)

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current)
      }
    }
  }, [deals])

  const handleMouseMove = (e) => {
    mouseXRef.current = e.clientX
  }

  const handleMouseEnter = () => {
    isHoveredRef.current = true
  }

  const handleMouseLeave = () => {
    isHoveredRef.current = false
  }

  const handleTrackDeal = (url) => {
    const event = new CustomEvent("fill-track-url", { detail: { url } })
    window.dispatchEvent(event)
  }

  const getWebsiteBadge = (site) => {
    const formatted = site.toUpperCase()
    if (formatted === "AMAZON") {
      return (
        <span className="px-2.5 py-0.5 text-[10px] font-bold tracking-widest rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
          AMAZON
        </span>
      )
    } else if (formatted === "FLIPKART") {
      return (
        <span className="px-2.5 py-0.5 text-[10px] font-bold tracking-widest rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
          FLIPKART
        </span>
      )
    } else if (formatted === "MYNTRA") {
      return (
        <span className="px-2.5 py-0.5 text-[10px] font-bold tracking-widest rounded bg-pink-500/10 text-pink-400 border border-pink-500/20">
          MYNTRA
        </span>
      )
    } else {
      return (
        <span className="px-2.5 py-0.5 text-[10px] font-bold tracking-widest rounded bg-teal-500/10 text-teal-400 border border-teal-500/20">
          AJIO
        </span>
      )
    }
  }

  // Triplicate the deals array for infinite marquee looping
  const triplicatedDeals = [...deals, ...deals, ...deals]

  if (loading && deals.length === 0) {
    return (
      <div className="w-full py-24 flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-zinc-500 text-sm font-medium">Loading premium live deals...</p>
        </div>
      </div>
    )
  }

  return (
    <section className="relative w-full pt-1.5 pb-2 bg-transparent overflow-hidden">
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes text-glow {
          0%, 100% { text-shadow: 0 0 4px rgba(52,211,153,0.1); }
          50% { text-shadow: 0 0 12px rgba(52,211,153,0.4); }
        }
        .live-glow {
          animation: text-glow 2s ease-in-out infinite;
        }
        .price-flash-down {
          animation: price-drop-glow 1.2s ease-out;
        }
        .price-flash-up {
          animation: price-rise-glow 1.2s ease-out;
        }
        @keyframes price-drop-glow {
          0% { color: #34d399; text-shadow: 0 0 20px #34d399; transform: scale(1.05); }
          100% { color: inherit; text-shadow: none; transform: scale(1); }
        }
        @keyframes price-rise-glow {
          0% { color: #f87171; text-shadow: 0 0 20px #f87171; transform: scale(1.05); }
          100% { color: inherit; text-shadow: none; transform: scale(1); }
        }
      `}</style>

      {/* Decorative ambient lighting behind marquee */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-[120px] bg-gradient-to-r from-emerald-500/5 via-cyan-500/5 to-emerald-500/5 blur-[80px] pointer-events-none rounded-full z-0" />

      {/* Header Container */}
      <div className="relative max-w-7xl mx-auto px-6 mb-1.5 flex items-center justify-between gap-4 z-10">
        <div className="flex items-center gap-3">
          <h2 className="text-[16px] md:text-[20px] font-extrabold tracking-tight text-white">
            Most Selling & <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Lowest Price Deals</span>
          </h2>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-bold uppercase tracking-wider">
            <span className="w-1 h-1 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Live</span>
          </div>
        </div>
      </div>

      {/* Interactive Horizontal Scroll Area */}
      <div 
        className="relative w-full z-10"
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Left/Right Edge Shadows for smooth aesthetic blend */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-black to-transparent pointer-events-none z-20" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-black to-transparent pointer-events-none z-20" />

        <div
          ref={containerRef}
          className="flex gap-4 overflow-x-auto no-scrollbar py-1.5 px-10 select-none cursor-grab"
        >
          {triplicatedDeals.map((deal, index) => {
            const status = priceChanges[deal.id]
            const priceClass = status === "down" ? "price-flash-down text-emerald-400 font-extrabold" : status === "up" ? "price-flash-up text-red-400 font-extrabold" : "text-emerald-400"
            
            // Sync hover shadows and borders with the page's dual color accents (emerald and cyan)
            const isEven = index % 2 === 0
            const hoverBorderClass = isEven ? "hover:border-emerald-500/30" : "hover:border-cyan-500/30"
            const hoverShadowClass = isEven 
              ? "hover:shadow-[0_15px_30px_-10px_rgba(16,185,129,0.25)]" 
              : "hover:shadow-[0_15px_30px_-10px_rgba(6,182,212,0.25)]"
            
            const btnHoverBorder = isEven ? "hover:border-emerald-500/40" : "hover:border-cyan-500/40"
            const btnHoverText = isEven ? "hover:text-emerald-400" : "hover:text-cyan-400"
            const btnGroupBg = isEven ? "group-hover:bg-emerald-500/5" : "group-hover:bg-cyan-500/5"
            const iconColor = isEven ? "group-hover:text-emerald-400" : "group-hover:text-cyan-400"

            return (
              <motion.div
                key={`${deal.id}-${index}`}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className={`flex-shrink-0 w-[215px] bg-zinc-950/40 border border-white/5 rounded-xl p-2 flex flex-col justify-between backdrop-blur-md relative overflow-hidden transition-all duration-300 ${hoverBorderClass} ${hoverShadowClass} group`}
              >
                {/* Floating Discount Pill */}
                <div className="absolute top-3 left-3 z-30">
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500 text-black text-[10px] font-black tracking-wide shadow-md">
                    <TrendingDown className="w-3.5 h-3.5" />
                    <span>{deal.discountPercent}% OFF</span>
                  </div>
                </div>

                {/* Website Floating Badge */}
                <div className="absolute top-3 right-3 z-30">
                  {getWebsiteBadge(deal.website)}
                </div>

                {/* Product Image Panel */}
                <div className="relative w-full h-[95px] bg-zinc-900/50 rounded-lg overflow-hidden mb-1.5 border border-white/5 flex items-center justify-center">
                  <img
                    src={deal.imageUrl}
                    alt={deal.name}
                    className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-500 pointer-events-none"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/40 via-transparent to-transparent pointer-events-none" />
                </div>

                {/* Details Area */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    {/* Rating and Reviews */}
                    <div className="flex items-center gap-1 mb-1">
                      <div className="flex items-center text-amber-400">
                        <Star className="w-3 h-3 fill-current" />
                        <span className="text-[11px] font-bold ml-0.5">{deal.rating}</span>
                      </div>
                      <span className="text-[10px] text-zinc-500">({deal.reviewsCount.toLocaleString()} reviews)</span>
                    </div>

                    {/* Product Title */}
                    <h3 className="text-white font-bold text-[11px] leading-snug line-clamp-1 mb-1 tracking-tight group-hover:text-emerald-400 transition-colors duration-200">
                      {deal.name}
                    </h3>
                  </div>

                  {/* Pricing and Button */}
                  <div>
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className={`text-sm font-black tracking-tight transition-all duration-300 ${priceClass}`}>
                        ₹{deal.currentPrice.toLocaleString("en-IN")}
                      </span>
                      <span className="text-[10px] text-zinc-500 line-through">
                        ₹{deal.originalPrice.toLocaleString("en-IN")}
                      </span>
                      
                      {/* Live flashing feedback arrow */}
                      <AnimatePresence>
                        {status && (
                          <motion.span
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className={`text-[10px] font-bold ${status === "down" ? "text-emerald-400" : "text-red-400"}`}
                          >
                            {status === "down" ? "📉" : "📈"}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Interactive Button */}
                    <button
                      onClick={() => handleTrackDeal(deal.url)}
                      className={`w-full py-1.5 rounded-lg bg-zinc-900 border border-white/5 ${btnHoverBorder} text-zinc-300 ${btnHoverText} text-[10px] font-bold transition-all duration-200 flex items-center justify-center gap-1 cursor-pointer shadow-sm ${btnGroupBg}`}
                    >
                      <Zap className="w-3.5 h-3.5 transition-transform duration-300 group-hover:scale-110" />
                      <span>Track this Deal</span>
                      <ArrowUpRight className={`w-3 h-3 text-zinc-500 ${iconColor} transition-colors`} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
