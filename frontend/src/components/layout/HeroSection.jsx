import { useNavigate, Link } from "react-router-dom"
import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { useToast } from "../../context/ToastContext"
import { trackProduct } from "../../services/productService"

export default function HeroSection() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const canvasRef = useRef(null)

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("token"))
  }, [])

  useEffect(() => {
    const handleFillUrl = (e) => {
      if (e.detail?.url) {
        setUrl(e.detail.url)
        const inputEl = document.querySelector('form input[placeholder*="Paste Amazon"]')
        if (inputEl) {
          inputEl.focus()
        }
        window.scrollTo({ top: 0, behavior: "smooth" })
        showToast("Deal URL pasted! Click 'Track Product' to start tracking. 🚀", "info")
      }
    }
    window.addEventListener("fill-track-url", handleFillUrl)
    return () => {
      window.removeEventListener("fill-track-url", handleFillUrl)
    }
  }, [showToast])

  // Canvas price drop & particle animation
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    let animationFrameId
    
    // Set fixed proportions
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    
    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)
    
    const gridSpacing = 80
    let phase = 0
    
    // Initialize floating particles
    const particleCount = 20
    const particles = []
    const w = canvas.width
    const h = canvas.height
    
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * (w > 0 ? w : 1000),
        y: Math.random() * (h > 0 ? h : 600),
        size: Math.random() * 1.5 + 0.5,
        speed: Math.random() * 0.3 + 0.15,
        baseAlpha: Math.random() * 0.4 + 0.1
      })
    }
    
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const w = canvas.width
      const h = canvas.height
      
      // Update particles if resized or initialized
      if (particles.length > 0 && (particles[0].x > w || particles[0].y > h)) {
        particles.forEach(p => {
          if (p.x > w) p.x = Math.random() * w
          if (p.y > h) p.y = Math.random() * h
        })
      }
      
      // 1. Draw Rolling Grid (simulates live rolling ticker)
      const xOffset = (phase * 10) % gridSpacing
      const yOffset = (phase * 5) % gridSpacing
      
      ctx.strokeStyle = "rgba(255, 255, 255, 0.008)"
      ctx.lineWidth = 0.75
      
      for (let x = -gridSpacing + xOffset; x < w + gridSpacing; x += gridSpacing) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, h)
        ctx.stroke()
      }
      for (let y = -gridSpacing + yOffset; y < h + gridSpacing; y += gridSpacing) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(w, y)
        ctx.stroke()
      }
      
      // 2. Draw drifting data packets (particles)
      particles.forEach(p => {
        const pulse = Math.sin(phase * 2 + p.x) * 0.2 + 0.8
        ctx.fillStyle = `rgba(52, 211, 153, ${p.baseAlpha * pulse})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
        
        // Move slowly upwards
        p.y -= p.speed
        if (p.y < 0) {
          p.y = h
          p.x = Math.random() * w
        }
      })
      
      // 3. Draw Price Curve (Sweeps neatly below main text and input bar)
      const paddingX = w * 0.06
      const startX = paddingX
      const endX = w - paddingX
      
      ctx.beginPath()
      ctx.lineWidth = 1.75
      
      const pathGradient = ctx.createLinearGradient(startX, 0, endX, 0)
      pathGradient.addColorStop(0, "rgba(6, 182, 212, 0.25)") // cyan
      pathGradient.addColorStop(0.5, "rgba(16, 185, 129, 0.35)") // emerald
      pathGradient.addColorStop(1, "rgba(16, 185, 129, 0.6)") // glowing emerald
      ctx.strokeStyle = pathGradient
      
      ctx.shadowBlur = 8
      ctx.shadowColor = "rgba(16, 185, 129, 0.15)"
      
      const points = []
      const step = 8
      
      for (let x = startX; x <= endX; x += step) {
        const t = (x - startX) / (endX - startX)
        
        // Aligned nicely to drop from h * 0.35 (top-left) to h * 0.72 (bottom-right)
        let baseY = h * 0.36
        if (t < 0.32) {
          baseY = h * 0.36 - (t / 0.32) * (h * 0.05)
        } else {
          const dropT = (t - 0.32) / 0.68
          baseY = (h * 0.31) + (dropT * (h * 0.41))
        }
        
        // Delicate oscillation to simulate live tracking
        const wave = Math.sin(t * Math.PI * 4 + phase) * 6
        const y = baseY + wave
        
        points.push({ x, y })
        if (x === startX) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }
      ctx.stroke()
      
      // Draw smooth transparent gradient underneath curve
      ctx.shadowBlur = 0
      ctx.lineTo(endX, h)
      ctx.lineTo(startX, h)
      ctx.closePath()
      const areaGradient = ctx.createLinearGradient(0, h * 0.3, 0, h)
      areaGradient.addColorStop(0, "rgba(16, 185, 129, 0.01)")
      areaGradient.addColorStop(1, "rgba(16, 185, 129, 0)")
      ctx.fillStyle = areaGradient
      ctx.fill()
      
      // 4. Gliding tracking dots along the curve
      ctx.shadowBlur = 6
      ctx.shadowColor = "rgba(52, 211, 153, 0.5)"
      ctx.fillStyle = "rgba(52, 211, 153, 0.7)"
      
      const dotTimes = [
        (phase * 0.035) % 1.0,
        ((phase * 0.035) + 0.5) % 1.0
      ]
      
      dotTimes.forEach(dt => {
        const idx = Math.floor(dt * (points.length - 1))
        if (idx >= 0 && idx < points.length) {
          const pt = points[idx]
          ctx.beginPath()
          ctx.arc(pt.x, pt.y, 3, 0, Math.PI * 2)
          ctx.fill()
        }
      })
      
      // 5. Clean, high-end annotations
      // Start price
      const idxStart = Math.floor(0.12 * (points.length - 1))
      if (idxStart < points.length) {
        const ptStart = points[idxStart]
        ctx.shadowBlur = 0
        ctx.fillStyle = "rgba(255, 255, 255, 0.15)"
        ctx.font = "500 10.5px system-ui, sans-serif"
        ctx.fillText("₹14,999", ptStart.x - 20, ptStart.y - 12)
      }
      
      // Dropped price target
      const idxEnd = Math.floor(0.88 * (points.length - 1))
      if (idxEnd < points.length) {
        const ptEnd = points[idxEnd]
        ctx.shadowBlur = 0
        ctx.fillStyle = "#34d399"
        ctx.font = "600 11.5px system-ui, sans-serif"
        ctx.fillText("₹9,999", ptEnd.x - 15, ptEnd.y - 12)
        
        // Alert card
        ctx.beginPath()
        ctx.fillStyle = "rgba(16, 185, 129, 0.06)"
        ctx.strokeStyle = "rgba(16, 185, 129, 0.25)"
        ctx.lineWidth = 0.75
        if (ctx.roundRect) {
          ctx.roundRect(ptEnd.x - 20, ptEnd.y - 32, 54, 15, 3)
        } else {
          ctx.rect(ptEnd.x - 20, ptEnd.y - 32, 54, 15)
        }
        ctx.fill()
        ctx.stroke()
        
        ctx.fillStyle = "#34d399"
        ctx.font = "bold 8.5px system-ui, sans-serif"
        ctx.fillText("PRICE DROP", ptEnd.x - 15, ptEnd.y - 22)
      }
      
      phase += 0.01
      animationFrameId = requestAnimationFrame(draw)
    }
    
    draw()
    
    return () => {
      window.removeEventListener("resize", resizeCanvas)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  const handleTrackSubmit = async (e) => {
    e.preventDefault()

    if (!url.trim()) {
      showToast("Please enter a product URL", "error")
      return
    }

    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      showToast("Please enter a valid link starting with http:// or https://", "error")
      return
    }

    if (isLoggedIn) {
      setLoading(true)
      try {
        await trackProduct(url.trim())
        showToast("Product added to watchlist successfully! 🚀", "success")
        setUrl("")
        navigate("/dashboard")
      } catch (error) {
        console.error(error)
        showToast(error.response?.data?.message || "Failed to scrape product details. Please check the URL.", "error")
      } finally {
        setLoading(false)
      }
    } else {
      sessionStorage.setItem("pendingTrackUrl", url.trim())
      showToast("Create a free account to track this product! 🚀", "info")
      navigate("/register")
    }
  }

  return (
    <section className="relative flex-1 flex items-center justify-center bg-transparent overflow-hidden px-6 py-2">

      {/* Animated Price Dropping Graph Background */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0 pointer-events-none opacity-30 mix-blend-screen" />

      <div className="relative z-10 text-center max-w-5xl mx-auto w-full flex flex-col items-center">

        <style>{`
          @keyframes gradient-shift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          @keyframes float-slow {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-8px); }
            100% { transform: translateY(0px); }
          }
          .animate-gradient-text {
            background-size: 200% auto;
            animation: gradient-shift 4s ease infinite;
          }
          .animate-float-1 {
            animation: float-slow 5s ease-in-out infinite;
          }
          .animate-float-2 {
            animation: float-slow 5s ease-in-out infinite;
            animation-delay: 0.6s;
          }
          .animate-float-3 {
            animation: float-slow 5s ease-in-out infinite;
            animation-delay: 1.2s;
          }
        `}</style>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.15,
                delayChildren: 0.1
              }
            }
          }}
          className="flex flex-col items-center justify-center select-none"
        >
          <div className="flex flex-wrap items-center justify-center gap-x-5">
            <motion.span
              variants={{
                hidden: { y: 20, opacity: 0 },
                visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 12 } }
              }}
              className="inline-block text-4xl md:text-6xl font-black text-white tracking-tight animate-float-1"
            >
              Track
            </motion.span>
            <motion.span
              variants={{
                hidden: { y: 20, opacity: 0 },
                visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 12 } }
              }}
              className="inline-block text-4xl md:text-6xl font-black text-white tracking-tight animate-float-2"
            >
              Prices
            </motion.span>
          </div>

          <motion.div
            variants={{
              hidden: { y: 20, opacity: 0 },
              visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 12 } }
            }}
            className="mt-2 animate-float-3"
          >
            <span className="inline-block text-3xl md:text-[48px] font-black bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-text filter drop-shadow-[0_0_20px_rgba(52,211,153,0.2)]">
              Automatically
            </span>
          </motion.div>
        </motion.div>

        <p
          className="
          mt-1.5
          text-gray-400
          text-[16px]
          md:text-[20px]
          max-w-2xl
          mx-auto
          leading-relaxed
          "
        >
          Monitor product prices in real-time from Amazon, Flipkart, Myntra, and Ajio. 
          Get instant alerts when prices drop.
        </p>

        {/* TRACKING INPUT BAR */}
        <form onSubmit={handleTrackSubmit} className="mt-2.5 max-w-2xl mx-auto w-full relative z-20">
          <div className="flex flex-col md:flex-row items-center gap-3 bg-zinc-950/60 border border-white/10 p-1.5 rounded-[22px] focus-within:border-emerald-500/40 focus-within:ring-1 focus-within:ring-emerald-500/20 transition-all duration-300 shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl">
            <input
              type="text"
              placeholder="Paste Amazon, Flipkart, Myntra, or Ajio product link..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={loading}
              className="flex-1 bg-transparent border-none outline-none px-4 py-2 text-white text-[14px] placeholder-zinc-500 w-full disabled:opacity-55"
            />
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.03, boxShadow: "0px 0px 20px rgba(16,185,129,0.45)" }}
              whileTap={{ scale: 0.97 }}
              className="bg-emerald-500 hover:bg-emerald-400 text-black text-[13px] font-bold px-6 py-2.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer w-full md:w-auto flex-shrink-0 disabled:opacity-60 shadow-lg shadow-emerald-500/10"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Tracking...</span>
                </>
              ) : (
                <span>Track Product</span>
              )}
            </motion.button>
          </div>
        </form>

        {/* BOTTOM NAVIGATION SUGGESTIONS */}
        <div className="mt-2.5 relative z-20">
          {isLoggedIn ? (
            <Link 
              to="/dashboard" 
              className="text-emerald-400 hover:text-emerald-300 font-semibold text-sm transition flex items-center justify-center gap-1.5"
            >
              <span>Go to your Dashboard</span>
              <span>➔</span>
            </Link>
          ) : (
            <Link 
              to="/register" 
              className="text-zinc-500 hover:text-zinc-300 font-semibold text-sm transition flex items-center justify-center gap-1.5"
            >
              <span>Or create an account directly</span>
              <span>➔</span>
            </Link>
          )}
        </div>

      </div>

    </section>
  )
}