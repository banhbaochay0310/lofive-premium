import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Hero } from '@/components/sections/Hero';
import { PricingSection } from '@/components/sections/Pricing';
import { Features } from '@/components/sections/Features';

/**
 * Landing page — public marketing page
 * Shows Hero, Pricing, Features with Header/Footer
 */
export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-surface-base text-text-primary">
      <Header />
      <main className="flex-1">
        <Hero />
        <PricingSection />
        <Features />
      </main>
      <Footer />
    </div>
  );
}
