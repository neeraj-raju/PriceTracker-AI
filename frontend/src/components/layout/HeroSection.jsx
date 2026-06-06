import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"

export default function HeroSection() {
  const navigate = useNavigate()
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("token"))
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-black overflow-hidden px-6">

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_left,#00ffb355,transparent_45%)]" />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_right,#00c8ff33,transparent_45%)]" />

      <div className="relative z-10 text-center max-w-6xl mx-auto">

        <h1
          className="
          text-6xl
          md:text-8xl
          font-extrabold
          leading-tight
          "
        >
          Track Prices
        </h1>

        <h2
          className="
          text-5xl
          md:text-7xl
          font-black
          mt-3
          bg-gradient-to-r
          from-emerald-400
          to-cyan-400
          bg-clip-text
          text-transparent
          "
        >
          Automatically
        </h2>

        <p
          className="
          mt-10
          text-gray-400
          text-lg
          md:text-2xl
          max-w-4xl
          mx-auto
          leading-relaxed
          "
        >
          Monitor product prices in real-time
          with intelligent tracking, email alerts,
          and beautiful analytics.
        </p>

        <div className="flex justify-center gap-6 mt-12">

          {isLoggedIn ? (
            <>
              <button
                onClick={() => navigate("/dashboard")}
                className="
                px-10
                py-4
                rounded-2xl
                bg-emerald-500
                hover:bg-emerald-400
                font-bold
                text-black
                shadow-lg
                shadow-emerald-500/30
                transition
                cursor-pointer
                "
              >
                Go to Dashboard ➔
              </button>

              <button
                onClick={() => navigate("/dashboard?section=alerts")}
                className="
                px-10
                py-4
                rounded-2xl
                border
                border-gray-700
                hover:border-emerald-400
                text-emerald-400
                transition
                cursor-pointer
                "
              >
                View Alerts 🔔
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate("/register")}
                className="
                px-10
                py-4
                rounded-2xl
                bg-emerald-500
                hover:bg-emerald-400
                font-bold
                text-black
                shadow-lg
                shadow-emerald-500/30
                transition
                cursor-pointer
                "
              >
                Start Tracking ➔
              </button>

              <button
                onClick={() => navigate("/login")}
                className="
                px-10
                py-4
                rounded-2xl
                border
                border-gray-700
                hover:border-cyan-400
                transition
                cursor-pointer
                "
              >
                Sign In ➔
              </button>
            </>
          )}

        </div>

      </div>

    </section>
  )
}