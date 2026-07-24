import { Hero } from '@/components/landing/Hero';
import { FeatureCards } from '@/components/landing/FeatureCards';
import { TrendingTools } from '@/components/landing/TrendingTools';
import { HistorySection } from '@/components/landing/HistorySection';
import { Collections } from '@/components/landing/Collections';
import { WhyToolboxX } from '@/components/landing/WhyToolboxX';

export default function Home() {
  return (
    <div>
      <Hero />
      <FeatureCards />
      <TrendingTools />
      <HistorySection />
      <Collections />
      <WhyToolboxX />
    </div>
  );
}
