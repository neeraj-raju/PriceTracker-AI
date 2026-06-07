import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

const faqItems = [
  {
    question: "How does the price tracking scheduler work?",
    answer: "Our backend runs automated scheduling jobs that scrape your tracked product pages periodically. We query the platforms multiple times a day to catch flash sales, coupon reductions, and sudden price drop events."
  },
  {
    question: "Do I need to leave my computer or browser open?",
    answer: "No! The tracker runs entirely on our secure cloud servers. Once you paste a link and add it to your watchlist, you can shut down your device. We will monitor the price in the background and notify you immediately."
  },
  {
    question: "What channels can I receive price drop alerts on?",
    answer: "We support both Email alerts (sent directly to your inbox with product photos, price changes, and store checkout links) and browser Web Push notifications (which display on your desktop or mobile browser even when the tab is closed)."
  },
  {
    question: "What websites are supported for price tracking?",
    answer: "We support major online retailers including Amazon, Flipkart, Myntra, and Ajio. We are constantly updating our scrapers to bypass antibot blocks and support new online commerce platforms."
  },
  {
    question: "Is there a limit on how many products I can track?",
    answer: "No! PriceTracker AI is 100% free with no hidden tiers or payment walls. You can monitor unlimited items, customize target thresholds, and set up push/email alerts for as many products as you want."
  }
]

export default function FaqSection() {
  const [openFaq, setOpenFaq] = useState(null)

  const toggleFaq = (idx) => {
    setOpenFaq(openFaq === idx ? null : idx)
  }

  return (
    <section id="faq" className="relative bg-black px-8 py-24 overflow-hidden border-t border-white/5">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Frequently Asked Questions
          </h2>
          <p className="text-zinc-400 text-[15px] max-w-lg mx-auto">
            Everything you need to know about our free price monitoring system.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-4">
          {faqItems.map((item, idx) => {
            const isOpen = openFaq === idx
            return (
              <div 
                key={idx} 
                className="bg-zinc-900/10 border border-white/5 hover:border-white/10 rounded-2xl overflow-hidden transition-all duration-300 backdrop-blur-md"
              >
                <button 
                  onClick={() => toggleFaq(idx)}
                  className="w-full text-left px-6 py-5 flex justify-between items-center font-bold text-zinc-200 hover:text-emerald-400 transition-colors cursor-pointer bg-transparent border-none outline-none"
                >
                  <span className="text-base md:text-lg tracking-tight pr-4">{item.question}</span>
                  
                  {/* Custom Chevron icon */}
                  <svg 
                    className={`w-5 h-5 text-zinc-400 transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180 text-emerald-400' : ''}`} 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="px-6 pb-6 text-zinc-400 text-sm md:text-[15px] leading-relaxed border-t border-white/5 pt-4">
                        {item.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
