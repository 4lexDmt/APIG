import HeroSection from '@/components/sections/HeroSection'
import HowItWorksSection from '@/components/sections/HowItWorksSection'
import ProviderLogosSection from '@/components/sections/ProviderLogosSection'
import FeaturesGridSection from '@/components/sections/FeaturesGridSection'
import CalculatorSection from '@/components/sections/CalculatorSection'
import PricingSection from '@/components/sections/PricingSection'
import SocialProofSection from '@/components/sections/SocialProofSection'
import Footer from '@/components/sections/Footer'

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <HowItWorksSection />
      <ProviderLogosSection />
      <FeaturesGridSection />
      <CalculatorSection />
      <PricingSection />
      <SocialProofSection />
      <Footer />
    </main>
  )
}
