import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Sparkles, Menu, X, LogIn } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_LINKS = [
  { label: 'Home',          href: '/' },
  { label: 'AI Tools',      href: '/ai-grammar-tools' },
  { label: 'Utility Tools', href: '/text-tools' },
  { label: 'Collections',   href: '/categories' },
  { label: 'History',       href: '/history' },
  { label: 'Pricing',       href: '/pricing' },
];

export function Navbar() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setOpen(false); }, [location]);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'border-b border-border/60 bg-background/80 backdrop-blur-xl shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between px-4 py-3 sm:px-6 lg:px-8">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 select-none">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#7C3AED]/10 text-[#7C3AED]">
            <Sparkles className="h-4.5 w-4.5" />
          </div>
          <span className="text-base font-bold tracking-tight text-foreground">ToolboxX</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                location === href
                  ? 'bg-[#7C3AED]/10 text-[#7C3AED]'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button className="hidden items-center gap-2 rounded-xl border border-border/60 bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-all hover:border-[#7C3AED]/40 hover:shadow-[0_0_0_3px_rgba(124,58,237,0.08)] sm:inline-flex">
            <LogIn className="h-4 w-4" />
            Sign In
          </button>
          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 bg-background text-muted-foreground transition-colors hover:text-foreground lg:hidden"
            aria-label="Menu"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="overflow-hidden border-t border-border/60 bg-background/95 backdrop-blur-xl lg:hidden"
          >
            <nav className="mx-auto flex max-w-[1400px] flex-col gap-1 px-4 py-3">
              {NAV_LINKS.map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className={`rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                    location === href
                      ? 'bg-[#7C3AED]/10 text-[#7C3AED]'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {label}
                </Link>
              ))}
              <div className="mt-2 border-t border-border/60 pt-2">
                <button className="flex w-full items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground">
                  <LogIn className="h-4 w-4" />
                  Sign In
                </button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
