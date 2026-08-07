import { useState } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowRight, Search, Bot, Sparkles } from 'lucide-react';
import { toolsData } from '@/lib/tools-data';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] as const },
});

const AI_CATEGORIES = [
  {
    emoji: '✍',
    name: 'AI Grammar & Writing',
    description: 'Grammar check, paraphrasing, summarizing, proofreading and text improvement tools.',
    href: '/ai-grammar-tools',
    filterCategories: ['ai-grammar'],
    accent: '#7C3AED',
    bg: 'from-[#7C3AED]/8 to-[#7C3AED]/3',
    border: 'border-[#7C3AED]/15',
    hoverShadow: 'rgba(124,58,237,0.12)',
  },
  {
    emoji: '📄',
    name: 'AI Resume & Career',
    description: 'Resumes, cover letters, LinkedIn headlines, professional bios and interview prep.',
    href: '/ai-resume-tools',
    filterCategories: ['ai-resume'],
    accent: '#2563EB',
    bg: 'from-[#2563EB]/8 to-[#2563EB]/3',
    border: 'border-[#2563EB]/15',
    hoverShadow: 'rgba(37,99,235,0.12)',
  },
  {
    emoji: '📱',
    name: 'AI Social Media',
    description: 'Captions, posts and descriptions for Instagram, X, TikTok, LinkedIn and YouTube.',
    href: '/ai-social-media-tools',
    filterCategories: ['ai-social'],
    accent: '#EC4899',
    bg: 'from-[#EC4899]/8 to-[#EC4899]/3',
    border: 'border-[#EC4899]/15',
    hoverShadow: 'rgba(236,72,153,0.12)',
  },
  {
    emoji: '📝',
    name: 'AI Blogging & SEO',
    description: 'Blog titles, outlines, article rewriting, meta tags, schema markup and SEO tools.',
    href: '/ai-blogging-seo-tools',
    filterCategories: ['ai-blogging-seo'],
    accent: '#059669',
    bg: 'from-[#059669]/8 to-[#059669]/3',
    border: 'border-[#059669]/15',
    hoverShadow: 'rgba(5,150,105,0.12)',
  },
  {
    emoji: '✉️',
    name: 'AI Email Tools',
    description: 'Cold emails, sales emails, follow-ups, support replies and thank-you notes.',
    href: '/ai-email-tools',
    filterCategories: ['ai-email'],
    accent: '#D97706',
    bg: 'from-[#D97706]/8 to-[#D97706]/3',
    border: 'border-[#D97706]/15',
    hoverShadow: 'rgba(217,119,6,0.12)',
  },
  {
    emoji: '🖊',
    name: 'AI Ghostwriting',
    description: 'Essays, stories, book outlines, chapters and speeches.',
    href: '/ai-ghostwriting-tools',
    filterCategories: ['ai-ghostwriting'],
    accent: '#7C3AED',
    bg: 'from-[#6D28D9]/8 to-[#6D28D9]/3',
    border: 'border-[#6D28D9]/15',
    hoverShadow: 'rgba(109,40,217,0.12)',
  },
  {
    emoji: '🎓',
    name: 'AI Study & Exams Hub',
    description: 'A premium study workspace for notes, quizzes, flashcards, planners, homework help, and exam prep.',
    href: '/study-exams-hub',
    filterCategories: ['ai-study-exams'],
    accent: '#7C3AED',
    bg: 'from-[#7C3AED]/8 to-[#7C3AED]/3',
    border: 'border-[#7C3AED]/15',
    hoverShadow: 'rgba(124,58,237,0.12)',
  },
  {
    emoji: '📢',
    name: 'AI Marketing & Ads',
    description: 'Ad copy, sales messaging, landing pages and CTAs for any platform or campaign.',
    href: '/ai-marketing-advertising',
    filterCategories: ['marketing'],
    accent: '#DC2626',
    bg: 'from-[#DC2626]/8 to-[#DC2626]/3',
    border: 'border-[#DC2626]/15',
    hoverShadow: 'rgba(220,38,38,0.12)',
  },
  {
    emoji: '🏢',
    name: 'AI Business',
    description: 'Business names, slogans, mission statements, company bios and product descriptions.',
    href: '/business-tools',
    filterCategories: ['business'],
    accent: '#0F766E',
    bg: 'from-[#0F766E]/8 to-[#0F766E]/3',
    border: 'border-[#0F766E]/15',
    hoverShadow: 'rgba(15,118,110,0.12)',
  },
  {
    emoji: '🎉',
    name: 'AI Event Planning',
    description: 'Plan birthdays, weddings, launches, and work events with AI-assisted itineraries, checklists, and invites.',
    href: '/ai-event-tools',
    filterCategories: ['ai-events'],
    accent: '#F59E0B',
    bg: 'from-[#F59E0B]/8 to-[#F59E0B]/3',
    border: 'border-[#F59E0B]/15',
    hoverShadow: 'rgba(245,158,11,0.12)',
  },
] as const;

// Quick-access popular AI tools
const FEATURED_AI_SLUGS = [
  'ai-writer', 'ai-grammar-checker', 'ai-resume-builder', 'ai-summarizer',
  'ai-email-writer', 'ai-paraphraser', 'ai-blog-title', 'ai-cover-letter',
];

export default function AiTools() {
  const [search, setSearch] = useState('');

  const totalAiTools = toolsData.filter(t =>
    ['ai-blogging-seo', 'ai-resume', 'ai-social', 'ai-email', 'ai-grammar',
     'ai-ghostwriting', 'marketing', 'business', 'ai-events', 'ai-study-exams'].includes(t.category)
  ).length;

  const visibleCategories = AI_CATEGORIES.filter(c =>
    search === '' || c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase())
  );

  const featuredTools = toolsData.filter(t => FEATURED_AI_SLUGS.includes(t.slug));

  return (
    <div className="pb-20">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-4 py-8 text-center">
        {/* Background gradient */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full"
               style={{ background: 'radial-gradient(ellipse, rgba(124,58,237,0.10) 0%, transparent 70%)' }} />
        </div>
        <div className="relative mx-auto max-w-3xl">
          <motion.div {...fadeUp(0)}>
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#7C3AED]/20 bg-[#7C3AED]/8 px-4 py-1.5 text-sm font-medium text-[#7C3AED]">
              <Bot className="h-3.5 w-3.5" />
              AI Tools
            </span>
          </motion.div>
          <motion.h1 {...fadeUp(0.06)}
            className="mt-3 text-3xl font-extrabold tracking-tight text-[#111827] dark:text-white sm:text-4xl">
            Powerful AI Tools,{' '}
            <span className="bg-gradient-to-r from-[#7C3AED] to-[#9F67FF] bg-clip-text text-transparent">
              One Place
            </span>
          </motion.h1>
          <motion.p {...fadeUp(0.12)}
            className="mx-auto mt-4 max-w-xl text-lg text-[#6B7280] dark:text-neutral-400">
            {totalAiTools}+ AI tools for writing, career, social media, SEO, email, studying and more.
          </motion.p>
          {/* Search */}
          <motion.div {...fadeUp(0.18)} className="mx-auto mt-8 max-w-md">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search AI categories..."
                className="w-full rounded-2xl border border-border/60 bg-white py-3 pl-10 pr-4 text-sm shadow-sm outline-none transition focus:border-[#7C3AED]/40 focus:ring-2 focus:ring-[#7C3AED]/10 dark:bg-card"
              />
            </div>
          </motion.div>
          {/* Stat pills */}
          <motion.div {...fadeUp(0.24)} className="mt-6 flex flex-wrap justify-center gap-3 text-sm">
            {[`${totalAiTools} AI tools`, `${AI_CATEGORIES.length} categories`, 'Free & instant'].map(s => (
              <span key={s} className="rounded-full border border-border/50 bg-white/80 px-3 py-1 text-[#6B7280] dark:bg-card">
                {s}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Category Grid ─────────────────────────────────────── */}
      <section className="px-4 pb-10">
        <div className="mx-auto max-w-[1400px]">
          {visibleCategories.length === 0 ? (
            <p className="py-16 text-center text-[#6B7280]">No categories match "{search}"</p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {visibleCategories.map((cat, i) => {
                const count = toolsData.filter(t => (cat.filterCategories as readonly string[]).includes(t.category)).length;
                return (
                  <motion.div key={cat.href} {...fadeUp(i * 0.05)} whileHover={{ y: -5 }}>
                    <Link href={cat.href}>
                      <div className={`group cursor-pointer rounded-[22px] border bg-gradient-to-br ${cat.bg} ${cat.border} p-6 transition-all duration-300 hover:shadow-[0_16px_48px_var(--hover-shadow)] bg-white dark:bg-card`}
                           style={{ '--hover-shadow': cat.hoverShadow } as React.CSSProperties}>
                        <div className="flex items-start justify-between">
                          <div className="text-3xl">{cat.emoji}</div>
                          <span className="rounded-full px-2.5 py-1 text-xs font-semibold"
                                style={{ backgroundColor: `${cat.accent}18`, color: cat.accent }}>
                            {count} tools
                          </span>
                        </div>
                        <h3 className="mt-4 text-lg font-bold text-[#111827] dark:text-white">{cat.name}</h3>
                        <p className="mt-1.5 text-sm leading-relaxed text-[#6B7280] dark:text-muted-foreground line-clamp-2">
                          {cat.description}
                        </p>
                        <div className="mt-4 flex items-center gap-1.5 text-sm font-medium transition-all duration-200"
                             style={{ color: cat.accent }}>
                          Explore tools
                          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── Featured AI Tools ─────────────────────────────────── */}
      <section className="px-4 pb-10">
        <div className="mx-auto max-w-[1400px]">
          <motion.div {...fadeUp(0)} className="mb-5">
            <p className="mb-0.5 text-xs font-semibold uppercase tracking-widest text-[#7C3AED]">Popular</p>
            <h2 className="text-xl font-bold text-[#111827] dark:text-white">Most-used AI Tools</h2>
          </motion.div>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
            {featuredTools.map((tool, i) => (
              <motion.div key={tool.slug} {...fadeUp(i * 0.04)} whileHover={{ y: -4 }}>
                <Link href={`/tools/ai/${tool.slug}`}>
                  <div className="group flex cursor-pointer items-start gap-3 rounded-[18px] border border-border/60 bg-white p-4 transition-all hover:border-[#7C3AED]/30 hover:shadow-[0_8px_24px_rgba(124,58,237,0.08)] dark:bg-card">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#7C3AED]/10">
                      <Sparkles className="h-4 w-4 text-[#7C3AED]" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#111827] dark:text-white">{tool.name}</p>
                      <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-[#6B7280] dark:text-muted-foreground">
                        {tool.description}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-[#7C3AED] opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
