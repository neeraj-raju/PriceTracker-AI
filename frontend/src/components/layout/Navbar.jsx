import { motion, AnimatePresence } from "framer-motion"
import { BellDot } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"

function Navbar() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
    if (token) {
      setUserName(localStorage.getItem("name") || "");
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    navigate("/login", { replace: true });
    setIsMenuOpen(false);
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="fixed top-0 left-0 w-full z-50 border-b border-white/5 bg-black/70 backdrop-blur-xl"
    >
      <div className="max-w-7xl mx-auto px-6 h-[56px] flex items-center justify-between">
        
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-3.5 hover:opacity-90 transition">
          <svg className="w-7 h-7 text-emerald-400 filter drop-shadow-[0_0_6px_rgba(52,211,153,0.35)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3v18h18" />
            <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
            <circle cx="18.7" cy="8" r="2.5" fill="currentColor" />
          </svg>
          <div className="flex items-center">
            <span className="font-black text-2xl tracking-tight text-white">PriceTracker</span>
            <span className="ml-2 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-black tracking-widest px-2 py-0.5 rounded-md uppercase">
              AI
            </span>
          </div>
        </Link>

        {/* DESKTOP LINKS (CENTERED) */}
        <nav className="hidden md:flex items-center gap-9">
          <a
            href="#how-it-works"
            className="text-zinc-300 hover:text-white transition-colors duration-200 text-[15px] font-semibold tracking-wide"
          >
            How it Works
          </a>
          <a
            href="#features"
            className="text-zinc-300 hover:text-white transition-colors duration-200 text-[15px] font-semibold tracking-wide"
          >
            Features
          </a>
          <a
            href="#about"
            className="text-zinc-300 hover:text-white transition-colors duration-200 text-[15px] font-semibold tracking-wide"
          >
            About
          </a>
          <a
            href="#faq"
            className="text-zinc-300 hover:text-white transition-colors duration-200 text-[15px] font-semibold tracking-wide"
          >
            FAQ
          </a>
        </nav>

        {/* DESKTOP ACTIONS (RIGHT) */}
        <div className="hidden md:flex items-center gap-6">
          {!isLoggedIn ? (
            <>
              <Link
                to="/login"
                className="text-zinc-300 hover:text-white transition-colors duration-200 text-[15px] font-semibold tracking-wide"
              >
                Sign In
              </Link>
              <Link to="/register">
                <motion.button
                  whileHover={{ scale: 1.03, boxShadow: "0px 0px 20px rgba(255,255,255,0.25)" }}
                  whileTap={{ scale: 0.97 }}
                  className="bg-white hover:bg-zinc-100 text-black text-[14px] font-bold px-6 py-2.5 rounded-full cursor-pointer transition-colors duration-200"
                >
                  Get Started
                </motion.button>
              </Link>
            </>
          ) : (
            <>
              <span className="text-zinc-300 font-semibold text-sm bg-zinc-900/60 border border-zinc-800/80 px-4 py-2 rounded-full flex items-center gap-2">
                <span>Hi,</span>
                <span className="text-emerald-400 font-bold">{userName || "User"}</span>
                <span>👋</span>
              </span>

              <Link to="/dashboard?section=alerts" title="Alerts Inbox" className="relative cursor-pointer hover:scale-105 transition text-zinc-300 hover:text-emerald-400">
                <BellDot size={20} />
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
              </Link>

              <Link to="/dashboard">
                <motion.button
                  whileHover={{ scale: 1.03, boxShadow: "0px 0px 20px rgba(16,185,129,0.45)" }}
                  whileTap={{ scale: 0.97 }}
                  className="bg-emerald-500 hover:bg-emerald-400 text-black text-[14px] font-bold px-6 py-2.5 rounded-full cursor-pointer transition-colors duration-200"
                >
                  Dashboard
                </motion.button>
              </Link>

              <button
                onClick={handleLogout}
                className="text-zinc-300 hover:text-white transition-colors duration-200 text-[15px] font-semibold tracking-wide cursor-pointer bg-transparent border-none"
              >
                Logout
              </button>
            </>
          )}
        </div>

        {/* MOBILE MENU TOGGLE BUTTON */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden text-zinc-300 hover:text-white transition-colors p-1"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? (
            <svg className="w-6.5 h-6.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" x2="6" y1="6" y2="18" />
              <line x1="6" x2="18" y1="6" y2="18" />
            </svg>
          ) : (
            <svg className="w-6.5 h-6.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
          )}
        </button>

      </div>

      {/* MOBILE DRAWER OVERLAY */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden border-t border-white/5 bg-black/95 backdrop-blur-xl overflow-hidden"
          >
            <div className="px-6 py-8 flex flex-col gap-6">
              
              {/* LINKS */}
              <div className="flex flex-col gap-4">
                <a
                  href="#how-it-works"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-zinc-300 hover:text-white transition text-lg font-semibold"
                >
                  How it Works
                </a>
                <a
                  href="#features"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-zinc-300 hover:text-white transition text-lg font-semibold"
                >
                  Features
                </a>
                <a
                  href="#about"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-zinc-300 hover:text-white transition text-lg font-semibold"
                >
                  About
                </a>
                <a
                  href="#faq"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-zinc-300 hover:text-white transition text-lg font-semibold"
                >
                  FAQ
                </a>
              </div>

              <hr className="border-white/5" />

              {/* ACTIONS */}
              <div className="flex flex-col gap-4">
                {!isLoggedIn ? (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="text-zinc-300 hover:text-white transition text-lg font-semibold py-1"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsMenuOpen(false)}
                      className="bg-white hover:bg-zinc-200 text-black text-center text-base font-bold py-3.5 rounded-full transition duration-200"
                    >
                      Get Started
                    </Link>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-zinc-300 font-semibold text-base">
                        Hi, <span className="text-emerald-400 font-bold">{userName || "User"}</span> 👋
                      </span>
                      <Link to="/dashboard?section=alerts" onClick={() => setIsMenuOpen(false)} className="relative text-zinc-300 hover:text-white">
                        <BellDot size={22} />
                        <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                      </Link>
                    </div>

                    <Link
                      to="/dashboard"
                      onClick={() => setIsMenuOpen(false)}
                      className="bg-emerald-500 hover:bg-emerald-400 text-black text-center text-base font-bold py-3.5 rounded-full transition duration-200"
                    >
                      Dashboard
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="text-left text-zinc-300 hover:text-white transition text-lg font-semibold py-1 bg-transparent border-none cursor-pointer"
                    >
                      Logout
                    </button>
                  </>
                )}
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}

export default Navbar