import { Link } from 'wouter';

const LINKS = {
  Explore: [
    { label: 'AI Tools',        href: '/ai-tools' },
    { label: 'Utility Tools',   href: '/utility-tools' },
    { label: 'Developer Tools', href: '/developer-tools' },
    { label: 'History',         href: '/history' },
  ],
  Resources: [
    { label: 'Blog',   href: '/blog' },
    { label: 'API',    href: '/api' },
    { label: 'Status', href: '/status' },
  ],
  Company: [
    { label: 'About',   href: '/about' },
    { label: 'Contact', href: '/contact' },
  ],
  Legal: [
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Privacy Policy',   href: '/privacy' },
    { label: 'DMCA Copyright',   href: '/dmca' },
  ],
};

// Social icons as inline SVG to avoid extra deps
function TwitterIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function GmailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 010 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.907 1.528-1.147C21.69 2.28 24 3.434 24 5.457z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-sidebar text-sidebar-foreground">
      <div className="mx-auto max-w-[1400px] px-4 pt-10 pb-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-7 md:grid-cols-5">

          {/* Brand column — takes 2 of 5 cols on large screens */}
          <div className="md:col-span-2">
            <Link href="/" className="mb-6 inline-flex items-center gap-2.5">
              <img src="/logo.png" alt="ToolboXX logo" className="h-9 w-9 object-contain" />
              <span className="text-base font-bold text-white">Toolbuxx</span>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              200+ free AI and utility tools for creators, students, developers and businesses. No sign-up. No tracking.
            </p>

            {/* Social icons */}
            <div className="mt-6 flex gap-3">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-sidebar-accent text-muted-foreground transition-colors hover:bg-sidebar-primary/20 hover:text-sidebar-foreground"
                aria-label="Twitter / X"
              >
                <TwitterIcon />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-sidebar-accent text-muted-foreground transition-colors hover:bg-sidebar-primary/20 hover:text-sidebar-foreground"
                aria-label="LinkedIn"
              >
                <LinkedInIcon />
              </a>
              <a
                href="mailto:hello@toolboxx.app"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-sidebar-accent text-muted-foreground transition-colors hover:bg-sidebar-primary/20 hover:text-sidebar-foreground"
                aria-label="Email"
              >
                <GmailIcon />
              </a>
            </div>
          </div>

          {/* Link columns */}
          {(Object.entries(LINKS) as [string, { label: string; href: string }[]][]).map(([group, links]) => (
            <div key={group}>
              <h4 className="mb-4 text-sm font-semibold text-white">{group}</h4>
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

        {/* Bottom bar */}
        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            Toolbuxx © {new Date().getFullYear()} · All rights reserved.
          </p>

          {/* Contact icons on right */}
          <div className="flex items-center gap-3">
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Twitter"
            >
              <TwitterIcon />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground transition-colors hover:text-foreground"
              aria-label="LinkedIn"
            >
              <LinkedInIcon />
            </a>
            <a
              href="mailto:hello@toolboxx.app"
              className="text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Email"
            >
              <GmailIcon />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
