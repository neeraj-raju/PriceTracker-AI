import React from "react";
import { Zap, BarChart3, Brain, GitCompare } from "lucide-react";

const cards = [
  {
    icon: <Zap size={24} className="text-emerald-400" />,
    title: "Instant Smart Alerts",
    className: "from-[#071414] to-[#021010] border-[#123]",
    text: "Receive real-time notifications via Email or Web Push the exact minute a price drops below your configured target."
  },
  {
    icon: <BarChart3 size={24} className="text-cyan-400" />,
    title: "Price History Analytics",
    className: "from-[#070f14] to-[#020a10] border-[#122]",
    text: "Beautifully visualize price movements over time. Spot promotional hikes, flash sales, and historical averages instantly."
  },
  {
    icon: <Brain size={24} className="text-emerald-400" />,
    title: "AI Price Intelligence",
    className: "from-[#0b1407] to-[#051002] border-[#231]",
    text: "Leverages standard deviation and linear regression to compute price volatility, forecast trends, and recommend buying action."
  },
  {
    icon: <GitCompare size={24} className="text-cyan-400" />,
    title: "Multi-Store Comparison",
    className: "from-[#140714] to-[#100210] border-[#313]",
    text: "Create custom groups to compare prices across Amazon, Flipkart, Myntra, and Ajio side-by-side to get the best deal."
  }
];

export default function FeaturesSection() {
  return (
    <section id="features" className="bg-black px-8 py-28 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-black text-center mb-5 text-zinc-100">
          Powerful Features
        </h2>
        <p className="text-zinc-400 text-center mb-16 text-base max-w-md mx-auto font-medium">
          Everything you need for premium price intelligence and automated e-commerce monitoring.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {cards.map((card) => (
            <div
              key={card.title}
              className={`bg-gradient-to-br ${card.className} border rounded-3xl p-8 hover:scale-[1.05] transition-all duration-300 shadow-xl shadow-black/45`}
            >
              <div className="mb-5 bg-white/5 border border-white/10 rounded-2xl w-12 h-12 flex items-center justify-center">
                {card.icon}
              </div>
              <h3 className="text-xl font-extrabold mb-4 text-zinc-100">
                {card.title}
              </h3>
              <p className="text-zinc-400 leading-relaxed text-sm">
                {card.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}