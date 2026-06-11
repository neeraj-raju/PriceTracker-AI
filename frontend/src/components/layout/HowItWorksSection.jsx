import { motion } from "framer-motion"
import { Link2, Sliders, Brain, BellRing } from "lucide-react"

const steps = [
  {
    number: "01",
    icon: <Link2 className="text-emerald-400" size={32} />,
    title: "Paste URL or Compare",
    text: "Find any product on Amazon, Flipkart, Myntra, or Ajio. Paste its URL to start tracking, or use our price comparison tool to search side-by-side."
  },
  {
    number: "02",
    icon: <Sliders className="text-cyan-400" size={32} />,
    title: "Set Target Price",
    text: "Specify your dream price. Select your preferred alert channels (instant Email alerts, browser Web Push notifications, or both)."
  },
  {
    number: "03",
    icon: <Brain className="text-emerald-400" size={32} />,
    title: "AI Analysis",
    text: "Our AI engine processes historical price data. It calculates volatility and linear regression trends to recommend 'Buy Now', 'Wait', or 'Monitor'."
  },
  {
    number: "04",
    icon: <BellRing className="text-cyan-400" size={32} />,
    title: "Receive Smart Drops",
    text: "Our background scheduler scrapes live prices 24/7. When a drop hits your threshold, it sends alert emails, push messages, and updates global feeds."
  }
]

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative bg-[#050505] px-8 py-28 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl font-black mb-4 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent"
          >
            How it Works
          </motion.h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Four simple steps to automate your price monitoring and save money on your online purchases.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {steps.map((step, idx) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15, duration: 0.6 }}
              className="bg-black/40 border border-white/5 hover:border-emerald-500/30 rounded-3xl p-8 relative group transition-all duration-300"
            >
              <div className="absolute -top-6 -left-6 text-8xl font-black text-white/5 select-none font-mono group-hover:text-emerald-500/10 transition duration-300">
                {step.number}
              </div>

              <div className="mb-6 bg-white/5 border border-white/10 rounded-2xl w-16 h-16 flex items-center justify-center">
                {step.icon}
              </div>

              <h3 className="text-xl font-extrabold mb-3 text-zinc-100 group-hover:text-emerald-400 transition duration-300">
                {step.title}
              </h3>

              <p className="text-zinc-450 leading-relaxed text-[13px]">
                {step.text}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
