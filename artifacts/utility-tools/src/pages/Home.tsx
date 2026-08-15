import { Hero } from '@/components/landing/Hero';
import { HistorySection } from '@/components/landing/HistorySection';
import { Collections } from '@/components/landing/Collections';
// Social bar removed per project ad cleanup

export default function Home() {
  return (
    <div className="bg-background">
      <Hero />
      <HistorySection />
      <Collections />
    </div>
  );
}
