import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Menu, X, Search, Home, Clock, FileText, Shield, Copyright } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from '@/components/ThemeToggle';

const SIDEBAR_LINKS = [
  { label: 'Home',             href: '/',         icon: Home },
  { label: 'History',          href: '/history',  icon: Clock },
  { label: 'Terms of Service', href: '/terms',    icon: FileText },
  { label: 'Privacy Policy',   href: '/privacy',  icon: Shield },
  { label: 'DMCA Copyright',   href: '/dmca',     icon: Copyright },
];

export function Navbar() {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close sidebar on navigation
  useEffect(() => { setSidebarOpen(false); }, [location]);

  // Prevent body scroll when sidebar open
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? 'border-b border-border/70 bg-background/95 shadow-sm backdrop-blur-xl'
            : 'bg-background'
        }`}
      >
        <div className="mx-auto flex w-full max-w-[1400px] items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">

          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-2.5 select-none">
            <img src="/logo.png" alt="Toolbuxx logo" className="h-9 w-9 object-contain" />
            <span className="text-base font-bold tracking-tight text-foreground">Toolbuxx</span>
          </Link>

          {/* Centered search bar — grows to fill space */}
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search 200+ tools..."
              className="h-10 w-full rounded-full border border-border bg-input pl-10 pr-4 text-sm text-foreground shadow-sm outline-none transition-all placeholder:text-muted-foreground focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
            />
          </div>

          {/* Hamburger control */}
          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground shadow-sm transition-colors hover:border-primary/50 hover:text-foreground"
              aria-label="Open navigation menu"
            >
              <Menu className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-[2px]"
              onClick={() => setSidebarOpen(false)}
            />

            {/* Sidebar panel */}
            <motion.aside
              key="sidebar"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="fixed right-0 top-0 z-[70] flex h-full w-72 flex-col border-l border-sidebar-border bg-sidebar text-sidebar-foreground shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-sidebar-border px-6 py-4">
                <Link href="/" className="flex items-center gap-2.5" onClick={() => setSidebarOpen(false)}>
                  <img src="/logo.png" alt="Toolbuxx logo" className="h-8 w-8 object-contain" />
                  <span className="font-bold text-sidebar-foreground">Toolbuxx</span>
                </Link>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  aria-label="Close menu"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Nav links */}
              <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-0.5">
                {SIDEBAR_LINKS.map(({ label, href, icon: Icon }) => {
                  const isActive = location === href;
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-sidebar-primary/20 text-sidebar-foreground ring-1 ring-sidebar-primary/35'
                          : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/35 hover:text-sidebar-foreground'
                      }`}
                    >
                      <Icon
                        className={`h-4 w-4 shrink-0 ${isActive ? 'text-sidebar-primary' : 'text-sidebar-foreground/65'}`}
                      />
                      {label}
                    </Link>
                  );
                })}
              </nav>

              {/* Footer */}
              <div className="border-t border-sidebar-border px-6 py-4">
                <ThemeToggle />
                <p className="text-xs text-muted-foreground">
                  ToolboxX © {new Date().getFullYear()} · All rights reserved
                </p>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
