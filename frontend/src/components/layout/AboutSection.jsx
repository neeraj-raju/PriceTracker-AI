import { motion } from "framer-motion"
import { ShieldCheck, Cpu, BrainCircuit } from "lucide-react"

export default function AboutSection() {
  return (
    <section id="about" className="relative bg-black px-8 py-28 overflow-hidden border-t border-white/5">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Story Left */}
          <div className="lg:col-span-7">
            <motion.h2 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-5xl font-black mb-8 bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent"
            >
              Smart Shopping, Demystified.
            </motion.h2>
            
            <p className="text-zinc-300 text-lg leading-relaxed mb-6 font-semibold">
              Prices on e-commerce platforms fluctuate hourly. Retailers use advanced algorithms to dynamically raise and lower prices based on demand, cookies, and browsing habits. Our mission is to put the power back in your hands.
            </p>
            
            <p className="text-zinc-400 leading-relaxed mb-10 text-sm">
              PriceTracker AI is a high-performance price intelligence engine. We track your favorite products continuously, compile detailed historical analytics, compare prices side-by-side across stores, and trigger automated alerts when prices drop. No more manual refreshing or impulse buying.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#060606] border border-white/5 p-5 rounded-2xl">
                <ShieldCheck className="text-emerald-400 mb-3" size={24} />
                <h4 className="font-bold text-zinc-100 mb-1 text-sm">Verify Real Deals</h4>
                <p className="text-zinc-500 text-xs">Expose fake retail sale tags with real historical trends and price averages.</p>
              </div>
              <div className="bg-[#060606] border border-white/5 p-5 rounded-2xl">
                <Cpu className="text-cyan-400 mb-3" size={24} />
                <h4 className="font-bold text-zinc-100 mb-1 text-sm">Robust Scraping</h4>
                <p className="text-zinc-500 text-xs">Dual Jsoup + Curl fetchers to reliably pull prices without bot blocks.</p>
              </div>
              <div className="bg-[#060606] border border-white/5 p-5 rounded-2xl">
                <BrainCircuit className="text-emerald-400 mb-3" size={24} />
                <h4 className="font-bold text-zinc-100 mb-1 text-sm">AI intelligence</h4>
                <p className="text-zinc-500 text-xs">Statistical trend calculations and Linear Regression price forecasting.</p>
              </div>
            </div>
          </div>

          {/* Stats Box Right */}
          <div className="lg:col-span-5">
            <motion.div 
              initial={{ opacity: 0, y: 45 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-[#0c1414] to-black border border-[#163333] rounded-3xl p-10 shadow-2xl relative"
            >
              <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-emerald-500/10 blur-3xl rounded-full" />
              
              <h3 className="text-3xl font-black mb-8 text-zinc-100">Our Credibility</h3>

              <div className="space-y-8">
                <div>
                  <span className="text-5xl font-black text-emerald-400 block font-mono">4+</span>
                  <span className="text-zinc-400 font-semibold text-sm mt-1 block">E-commerce Stores Supported</span>
                  <span className="text-zinc-500 text-xs">Amazon · Flipkart · Myntra · Ajio</span>
                </div>
                
                <div className="border-t border-[#122] pt-6">
                  <span className="text-5xl font-black text-cyan-400 block font-mono">100%</span>
                  <span className="text-zinc-400 font-semibold text-sm mt-1 block">Real-Time Data Streams</span>
                  <span className="text-zinc-500 text-xs">Calculations based on actual price histories and verified drops</span>
                </div>

                <div className="border-t border-[#122] pt-6">
                  <span className="text-5xl font-black text-emerald-400 block font-mono">24/7</span>
                  <span className="text-zinc-400 font-semibold text-sm mt-1 block">Continuous Scraper Engine</span>
                  <span className="text-zinc-500 text-xs">Driven by our automated multi-threaded Spring Boot scheduler</span>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  )
}
