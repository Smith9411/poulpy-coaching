import Hero from '@/components/Hero';
import WhyPoulpy from '@/components/WhyPoulpy';
import Games from '@/components/Games';
import Method from '@/components/Method';
import Pricing from '@/components/Pricing';
import Testimonials from '@/components/Testimonials';
import FAQ from '@/components/FAQ';
import Progression from '@/components/Progression';
import Booking from '@/components/Booking';
import About from '@/components/About';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <WhyPoulpy />
      <Games />
      <Method />
      <Progression />
      <Booking />
      <Pricing />
      <Testimonials />
      <About />
      <FAQ />
    </main>
  );
}
