import { useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { History, Sparkles } from 'lucide-react';
import { Footer } from './Footer';
import { FeedbackButton } from './FeedbackButton';

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
  const [location] = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/30">
      <ScrollToTop />
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight text-foreground">Utility Tools</p>
              <p className="text-xs text-muted-foreground">AI-first browser utilities</p>
            </div>
          </Link>

          <nav className="flex items-center gap-2 text-sm">
            <Link
              href="/history"
              className={`inline-flex items-center gap-2 rounded-full px-3 py-2 transition-colors ${location === '/history' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
            >
              <History className="h-4 w-4" />
              History
            </Link>
            <Link
              href="/dmca-policy"
              className={`rounded-full px-3 py-2 transition-colors ${location === '/dmca-policy' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
            >
              DMCA
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[1400px] mx-auto p-4 md:p-6 lg:p-8">
        {children}
      </main>
      <Footer />
      <FeedbackButton />
    </div>
  );
}
