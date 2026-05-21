import Navbar from "../components/layout/Navbar"
import HeroSection from "../components/layout/HeroSection"
import FeaturesSection from "../components/layout/FeaturesSection"

function Home() {
  return (
    <div className="w-full min-h-screen bg-black text-white overflow-x-hidden">

      <Navbar />

      <main className="w-full">

        <HeroSection />

        <FeaturesSection />

      </main>

    </div>
  )
}

export default Home