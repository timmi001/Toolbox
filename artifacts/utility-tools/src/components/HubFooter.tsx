import { Github, Instagram, Linkedin, Sparkles, Twitter } from 'lucide-react';
import { Link } from 'wouter';

const LINK_GROUPS = [
  {
    title: 'Product',
    links: [
      ['All Hubs', '/'],
      ['Study Hub', '/hub/study'],
      ['Career Path', '/hub/career'],
      ['Business Hub', '/hub/business'],
      ['Creator Studio', '/hub/creator'],
    ],
  },
  {
    title: 'Company',
    links: [
      ['About', '/about'],
      ['Contact', '/contact'],
      ['Pricing', '/pricing'],
      ['Help Center', '/help-center'],
      ['Feedback', '/contact#feedback'],
    ],
  },
  {
    title: 'Legal',
    links: [
      ['Privacy Policy', '/privacy'],
      ['Terms of Service', '/terms'],
      ['Cookie Policy', '/cookie-policy'],
    ],
  },
] as const;

const SOCIAL_LINKS = [
  ['X / Twitter', 'https://twitter.com', Twitter],
  ['Instagram', 'https://instagram.com', Instagram],
  ['LinkedIn', 'https://linkedin.com', Linkedin],
  ['GitHub', 'https://github.com', Github],
] as const;

export function HubFooter() {
  return (
    <footer className="mt-12 border-t border-[#20252C] bg-[#080B10] px-4 py-10 text-[#D9E0E8] sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1216px]">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1.75fr)] lg:gap-16">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#38404A] bg-[#171B21] text-[#E5E7EB]">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="text-sm font-semibold tracking-tight text-white">Toolbuxx</span>
            </div>
            <h2 className="mt-5 text-lg font-semibold tracking-tight text-white">Your AI workspace for getting more done.</h2>
            <p className="mt-3 max-w-sm text-sm leading-6 text-[#8F9AA8]">Study smarter, create faster, build better, and get more done with AI-powered tools.</p>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3">
            {LINK_GROUPS.map((group) => (
              <div key={group.title}>
                <h3 className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#AEB7C2]">{group.title}</h3>
                <ul className="mt-4 space-y-3">
                  {group.links.map(([label, href]) => (
                    <li key={label}>
                      <Link href={href} className="text-xs text-[#788492] transition-colors hover:text-white">{label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-[#20252C] pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-[#788492]">© 2026 Toolbuxx. All rights reserved.</p>
          <div className="flex items-center gap-4">
            {SOCIAL_LINKS.map(([label, href, Icon]) => (
              <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} title={label} className="text-[#788492] transition-colors hover:text-white">
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
