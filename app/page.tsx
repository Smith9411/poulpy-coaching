import Hero from '@/components/Hero';
import WhyPoulpy from '@/components/WhyPoulpy';
import Method from '@/components/Method';
import Games from '@/components/Games';
import Pricing from '@/components/Pricing';
import Testimonials from '@/components/Testimonials';
import FAQ from '@/components/FAQ';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <WhyPoulpy />
      <Method />
      <Games />
      <Pricing />
      <Testimonials />
      <FAQ />
    </main>
  );
}
