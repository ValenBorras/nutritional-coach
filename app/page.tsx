import HeroSection from "@/app/components/HeroSection"
import FeaturesSection from "@/app/components/FeaturesSection"
import HowItWorksSection from "@/app/components/HowItWorksSection"
import TestimonialsSection from "@/app/components/TestimonialsSection"
import NutritionistSection from "@/app/components/NutritionistSection"
import CTASection from "@/app/components/CTASection"
import PWARedirect from "@/app/components/pwa-redirect"

export default function Home() {
  return (
    <>
      <PWARedirect />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <NutritionistSection />
      <CTASection />
    </>
  )
}
