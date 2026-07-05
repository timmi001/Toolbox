import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location]);
  return null;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/30">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1 w-full max-w-[1400px] mx-auto p-4 md:p-6 lg:p-8">
        {children}
      </main>
      <Footer />
    </div>
  );
}
