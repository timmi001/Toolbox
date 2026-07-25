import { Hero } from '@/components/landing/Hero';
import { HistorySection } from '@/components/landing/HistorySection';
import { Collections } from '@/components/landing/Collections';

export default function Home() {
  return (
    <div className="bg-white dark:bg-background">
      <Hero />
      <HistorySection />
      <Collections />
    </div>
  );
}
