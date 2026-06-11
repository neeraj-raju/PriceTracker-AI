import Navbar from "../components/layout/Navbar"
import HeroSection from "../components/layout/HeroSection"
import PlatformStatsStrip from "../components/layout/PlatformStatsStrip"
import LiveActivityFeed from "../components/layout/LiveActivityFeed"
import HowItWorksSection from "../components/layout/HowItWorksSection"
import FeaturesSection from "../components/layout/FeaturesSection"
import AboutSection from "../components/layout/AboutSection"
import FaqSection from "../components/layout/FaqSection"
import Footer from "../components/layout/Footer"

function Home() {
  return (
    <div className="w-full min-h-screen bg-black text-white overflow-x-hidden">

      <Navbar />

      <main className="w-full pt-[56px]">

        <div className="w-full min-h-[calc(100vh-56px)] flex flex-col justify-between pb-10 relative overflow-hidden bg-black">
          {/* Seamless Unified Ambient Glows blending Hero and stats sections */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_25%,#00ffb315,transparent_50%)] pointer-events-none z-0" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_45%,#00c8ff0f,transparent_50%)] pointer-events-none z-0" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_90%,#00ffb312,transparent_40%)] pointer-events-none z-0" />
          
          <HeroSection />
          <div className="w-full max-w-6xl mx-auto px-4 mt-8 space-y-4">
            <PlatformStatsStrip />
            <LiveActivityFeed />
          </div>
        </div>

        <HowItWorksSection />

        <FeaturesSection />

        <AboutSection />

        <FaqSection />

      </main>

      <Footer />

    </div>
  )
}

export default Home