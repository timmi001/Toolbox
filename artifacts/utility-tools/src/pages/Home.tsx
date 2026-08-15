import { Hero } from '@/components/landing/Hero';
import { HistorySection } from '@/components/landing/HistorySection';
import { Collections } from '@/components/landing/Collections';
import { useEffect, useRef } from 'react';

function SocialBar() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const src = 'https://pl30830725.effectivecpmnetwork.com/36/7e/ab/367eab3f1c8e1d8e69baa350789349e7.js';
    if (!ref.current) return;
    if (document.querySelector(`script[src="${src}"]`)) return;

    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    ref.current.appendChild(s);

    return () => {
      try { if (s.parentNode) s.parentNode.removeChild(s); } catch (e) { }
    };
  }, []);

  return <div ref={ref} id="social-bar-home" className="w-full my-6" />;
}

export default function Home() {
  return (
    <div className="bg-background">
      <Hero />
      <HistorySection />
      <SocialBar />
      <Collections />
    </div>
  );
}
