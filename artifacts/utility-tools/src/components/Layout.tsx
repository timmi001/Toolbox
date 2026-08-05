import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Navbar } from './landing/Navbar';
import { Footer } from './Footer';
import { FeedbackButton } from './FeedbackButton';

interface LayoutProps { children: React.ReactNode; }

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [location]);
  return null;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-[#7C3AED]/20">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1 w-full max-w-[1400px] mx-auto">
        {children}
      </main>
      <Footer />
      <FeedbackButton />
    </div>
  );
}
