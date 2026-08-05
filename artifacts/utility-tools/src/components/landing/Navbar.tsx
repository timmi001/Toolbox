import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Menu, X, Search, Home, Clock, Bookmark, FileText, Shield, Copyright } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SIDEBAR_LINKS = [
  { label: 'Home',             href: '/',         icon: Home },
  { label: 'History',          href: '/history',  icon: Clock },
  { label: 'Collections',      href: '/utility-tools', icon: Bookmark },
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
            ? 'border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur-xl'
            : 'bg-[#F8F9FA]'
        }`}
      >
        <div className="mx-auto flex w-full max-w-[1400px] items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">

          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-2.5 select-none">
            <img src="/logo.png" alt="ToolboxX logo" className="h-9 w-9 object-contain" />
            <span className="text-base font-bold tracking-tight text-gray-900">ToolboxX</span>
          </Link>

          {/* Centered search bar — grows to fill space */}
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search 200+ tools..."
              className="h-10 w-full rounded-full border border-gray-200 bg-white pl-10 pr-4 text-sm text-gray-800 shadow-sm outline-none transition-all placeholder:text-gray-400 focus:border-[#4B0082]/40 focus:ring-2 focus:ring-[#4B0082]/10"
            />
          </div>

          {/* Hamburger */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 shadow-sm transition-colors hover:border-gray-300 hover:text-gray-900"
            aria-label="Open navigation menu"
          >
            <Menu className="h-4.5 w-4.5" />
          </button>
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
              className="fixed right-0 top-0 z-[70] flex h-full w-72 flex-col bg-white shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                <Link href="/" className="flex items-center gap-2.5" onClick={() => setSidebarOpen(false)}>
                  <img src="/logo.png" alt="ToolboxX logo" className="h-8 w-8 object-contain" />
                  <span className="font-bold text-gray-900">ToolboxX</span>
                </Link>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
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
                          ? 'bg-[#4B0082]/8 text-[#4B0082]'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon
                        className={`h-4 w-4 shrink-0 ${isActive ? 'text-[#4B0082]' : 'text-gray-400'}`}
                      />
                      {label}
                    </Link>
                  );
                })}
              </nav>

              {/* Footer */}
              <div className="border-t border-gray-100 px-6 py-4">
                <p className="text-xs text-gray-400">
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
