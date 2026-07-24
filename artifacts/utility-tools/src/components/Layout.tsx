import { useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { History, Sparkles } from 'lucide-react';
import { Footer } from './Footer';
import { FeedbackButton } from './FeedbackButton';
import { ThemeToggle } from './ThemeToggle';

interface LayoutProps { children: React.ReactNode; }

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [location]);
  return null;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-[#6C4EFF]/20">
      <ScrollToTop />
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#6C4EFF]/20 bg-[#6C4EFF]/10 text-[#6C4EFF]">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight text-foreground">Utility Tools</p>
              <p className="text-xs text-muted-foreground">AI-first browser utilities</p>
            </div>
          </Link>

          {/* Right nav: History + Theme Toggle */}
          <nav className="flex items-center gap-2 text-sm">
            <Link
              href="/history"
              className={`inline-flex items-center gap-2 rounded-full px-3 py-2 transition-colors ${
                location === '/history'
                  ? 'bg-[#6C4EFF] text-white'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <History className="h-4 w-4" />
              History
            </Link>
            <ThemeToggle />
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[1400px] mx-auto">
        {children}
      </main>

      <Footer />
      <FeedbackButton />
    </div>
  );
}
