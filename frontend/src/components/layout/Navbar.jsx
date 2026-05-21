import { motion } from "framer-motion"
import { BellDot } from "lucide-react"
import { Link } from "react-router-dom"

function Navbar() {
  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 w-full z-50 border-b border-white/10 bg-black/70 backdrop-blur-xl"
    >
      <div className="max-w-7xl mx-auto px-6 h-[85px] flex items-center justify-between">

        <Link to="/">
          <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            PriceTracker AI
          </h1>
        </Link>

        <nav className="flex items-center gap-8">

          <a
            href="#features"
            className="text-zinc-300 hover:text-white transition text-lg"
          >
            Features
          </a>

          <Link
            to="/login"
            className="text-zinc-300 hover:text-white transition text-lg"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="text-zinc-300 hover:text-white transition text-lg"
          >
            Register
          </Link>

          <Link to="/dashboard">
            <button className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-6 py-3 rounded-xl transition">
              Dashboard
            </button>
          </Link>

          <BellDot className="text-emerald-400" size={22} />

        </nav>

      </div>
    </motion.header>
  )
}

export default Navbar