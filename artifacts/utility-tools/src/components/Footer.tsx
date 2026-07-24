import { Link } from 'wouter';
import { Sparkles } from 'lucide-react';

const LINKS = {
  Explore: [
    { label: 'AI Tools',      href: '/ai-grammar-tools' },
    { label: 'Utility Tools', href: '/text-tools' },
    { label: 'Collections',   href: '/categories' },
    { label: 'History',       href: '/history' },
  ],
  Resources: [
    { label: 'Blog',   href: '/blog' },
    { label: 'API',    href: '/api' },
    { label: 'Status', href: '/status' },
  ],
  Company: [
    { label: 'About',   href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'Privacy', href: '/privacy' },
    { label: 'Terms',   href: '/terms' },
  ],
};

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border/50 bg-background pt-16 pb-8">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          {/* Brand column */}
          <div className="md:col-span-1">
            <Link href="/" className="mb-5 inline-flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#7C3AED]/10 text-[#7C3AED]">
                <Sparkles className="h-4.5 w-4.5" />
              </div>
              <span className="text-base font-bold tracking-tight text-foreground">ToolboxX</span>
            </Link>
            <p className="text-sm leading-relaxed text-muted-foreground">
              200+ free AI and utility tools for creators, students, developers and businesses.
            </p>
            {/* Color dots */}
            <div className="mt-6 flex gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#7C3AED]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#10B981]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#F59E0B]" />
            </div>
          </div>

          {/* Link columns */}
          {(Object.entries(LINKS) as [string, { label: string; href: string }[]][]).map(([group, links]) => (
            <div key={group}>
              <h4 className="mb-4 text-sm font-semibold text-foreground">{group}</h4>
              <ul className="space-y-2.5">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/50 pt-8 text-center text-sm text-muted-foreground sm:flex-row sm:text-left">
          <p>© {new Date().getFullYear()} ToolboxX. All rights reserved.</p>
          <p className="text-xs">No backend calls · 100% client-side · Privacy first</p>
        </div>
      </div>
    </footer>
  );
}
