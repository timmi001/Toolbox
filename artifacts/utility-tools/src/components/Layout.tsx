import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { AppShell } from './AppShell';
import { FeedbackButton } from './FeedbackButton';

interface LayoutProps { children: React.ReactNode; }

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [location]);
  return null;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-[#121212] text-foreground">
      <ScrollToTop />
      <AppShell>
        {children}
        <FeedbackButton />
      </AppShell>
    </div>
  );
}
