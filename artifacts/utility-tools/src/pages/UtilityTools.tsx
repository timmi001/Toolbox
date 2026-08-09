import { useState } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowRight, Search, Wrench, Zap } from 'lucide-react';
import { toolsData, getToolRoutePath } from '@/lib/tools-data';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] as const },
});

const UTILITY_CATEGORIES = [
  {
    emoji: '💻',
    name: 'Developer Tools',
    description: 'JSON formatters, color pickers, hash generators, regex testers and network tools.',
    href: '/developer-tools',
    filterCategory: 'developer',
    accent: '#10B981',
    bg: 'from-[#10B981]/8 to-[#10B981]/3',
    border: 'border-[#10B981]/15',
    hoverShadow: 'rgba(16,185,129,0.12)',
  },
  {
    emoji: '✍',
    name: 'Text Tools',
    description: 'Word counter, case converter, lorem ipsum, slug generator and text cleaning utilities.',
    href: '/text-tools',
    filterCategory: 'text',
    accent: '#3B82F6',
    bg: 'from-[#3B82F6]/8 to-[#3B82F6]/3',
    border: 'border-[#3B82F6]/15',
    hoverShadow: 'rgba(59,130,246,0.12)',
  },
  {
    emoji: '🖼',
    name: 'Image Tools',
    description: 'Compress, resize, crop, rotate, convert and enhance images entirely in your browser.',
    href: '/image-tools',
    filterCategory: 'image',
    accent: '#F59E0B',
    bg: 'from-[#F59E0B]/8 to-[#F59E0B]/3',
    border: 'border-[#F59E0B]/15',
    hoverShadow: 'rgba(245,158,11,0.12)',
  },
  {
    emoji: '📄',
    name: 'PDF Tools',
    description: 'Merge, split, compress, protect, rotate and manipulate PDF files securely.',
    href: '/pdf-tools',
    filterCategory: 'pdf',
    accent: '#EF4444',
    bg: 'from-[#EF4444]/8 to-[#EF4444]/3',
    border: 'border-[#EF4444]/15',
    hoverShadow: 'rgba(239,68,68,0.12)',
  },
  {
    emoji: '🧮',
    name: 'Calculators',
    description: 'Finance, health, math, unit conversion, date and life calculators.',
    href: '/calculators',
    filterCategory: 'calculators',
    accent: '#8B5CF6',
    bg: 'from-[#8B5CF6]/8 to-[#8B5CF6]/3',
    border: 'border-[#8B5CF6]/15',
    hoverShadow: 'rgba(139,92,246,0.12)',
  },
  {
    emoji: '🎵',
    name: 'Audio Tools',
    description: 'Record, trim, merge, convert and clean audio files directly in your browser.',
    href: '/audio-tools',
    filterCategory: 'audio',
    accent: '#EC4899',
    bg: 'from-[#EC4899]/8 to-[#EC4899]/3',
    border: 'border-[#EC4899]/15',
    hoverShadow: 'rgba(236,72,153,0.12)',
  },
  {
    emoji: '🎥',
    name: 'Video Tools',
    description: 'Trim, compress, merge, subtitle and download videos with browser-based tools.',
    href: '/video-tools',
    filterCategory: 'video',
    accent: '#7C3AED',
    bg: 'from-[#7C3AED]/8 to-[#7C3AED]/3',
    border: 'border-[#7C3AED]/15',
    hoverShadow: 'rgba(124,58,237,0.12)',
  },
  {
    emoji: '📁',
    name: 'File Conversion',
    description: 'Convert MP4 to MP3, EPUB to PDF, Excel to CSV, CSV to JSON and more.',
    href: '/file-conversion-tools',
    filterCategory: 'file-conversion',
    accent: '#6B7280',
    bg: 'from-[#6B7280]/8 to-[#6B7280]/3',
    border: 'border-[#6B7280]/15',
    hoverShadow: 'rgba(107,114,128,0.12)',
  },
] as const;

const FEATURED_UTILITY_SLUGS = [
  'json-formatter', 'image-compressor', 'merge-pdf', 'uuid-generator',
  'word-counter', 'css-gradient', 'youtube-downloader', 'percentage-calculator',
];

export default function UtilityTools() {
  const [search, setSearch] = useState('');

  const totalUtilityTools = toolsData.filter(t =>
    ['developer', 'text', 'image', 'pdf', 'calculators', 'audio', 'video', 'file-conversion'].includes(t.category)
  ).length;

  const visibleCategories = UTILITY_CATEGORIES.filter(c =>
    search === '' || c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase())
  );

  const featuredTools = toolsData.filter(t => FEATURED_UTILITY_SLUGS.includes(t.slug));

  return (
    <div className="pb-20">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-4 py-16 text-center">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full"
               style={{ background: 'radial-gradient(ellipse, rgba(16,185,129,0.09) 0%, transparent 70%)' }} />
        </div>
        <div className="relative mx-auto max-w-3xl">
          <motion.div {...fadeUp(0)}>
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#10B981]/20 bg-[#10B981]/8 px-4 py-1.5 text-sm font-medium text-[#10B981]">
              <Wrench className="h-3.5 w-3.5" />
              Utility Tools
            </span>
          </motion.div>
          <motion.h1 {...fadeUp(0.06)}
            className="mt-3 text-4xl font-extrabold tracking-tight text-[#111827] dark:text-white sm:text-5xl lg:text-6xl">
            Everyday Tools That{' '}
            <span className="bg-gradient-to-r from-[#10B981] to-[#059669] bg-clip-text text-transparent">
              Save Time
            </span>
          </motion.h1>
          <motion.p {...fadeUp(0.12)}
            className="mx-auto mt-4 max-w-xl text-lg text-[#6B7280] dark:text-neutral-400">
            {totalUtilityTools}+ free utility tools for PDFs, images, code, media, files and calculations.
          </motion.p>
          {/* Search */}
          <motion.div {...fadeUp(0.18)} className="mx-auto mt-8 max-w-md">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search utility categories..."
                className="w-full rounded-2xl border border-border/60 bg-input py-3 pl-10 pr-4 text-sm text-foreground shadow-sm outline-none transition focus:border-[#10B981]/40 focus:ring-2 focus:ring-[#10B981]/10"
              />
            </div>
          </motion.div>
          <motion.div {...fadeUp(0.24)} className="mt-6 flex flex-wrap justify-center gap-3 text-sm">
            {[`${totalUtilityTools} utility tools`, `${UTILITY_CATEGORIES.length} categories`, '100% browser-based'].map(s => (
              <span key={s} className="rounded-full border border-border/50 bg-card px-3 py-1 text-muted-foreground">
                {s}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Category Grid ─────────────────────────────────────── */}
      <section className="px-4 pb-16">
        <div className="mx-auto max-w-[1400px]">
          {visibleCategories.length === 0 ? (
            <p className="py-20 text-center text-[#6B7280]">No categories match "{search}"</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {visibleCategories.map((cat, i) => {
                const count = toolsData.filter(t => t.category === cat.filterCategory).length;
                return (
                  <motion.div key={cat.href} {...fadeUp(i * 0.04)} whileHover={{ y: -5 }}>
                    <Link href={cat.href}>
                      <div className={`group cursor-pointer rounded-[22px] border bg-gradient-to-br ${cat.bg} ${cat.border} p-6 transition-all duration-300 bg-card`}
                           style={{ '--hover-shadow': cat.hoverShadow } as React.CSSProperties}
                           onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.boxShadow = `0 16px 48px ${cat.hoverShadow}`}
                           onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.boxShadow = ''}>
                        <div className="flex items-start justify-between">
                          <div className="text-3xl">{cat.emoji}</div>
                          <span className="rounded-full px-2.5 py-1 text-xs font-semibold"
                                style={{ backgroundColor: `${cat.accent}18`, color: cat.accent }}>
                            {count} tools
                          </span>
                        </div>
                        <h3 className="mt-4 text-base font-bold text-[#111827] dark:text-white">{cat.name}</h3>
                        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-[#6B7280] dark:text-muted-foreground">
                          {cat.description}
                        </p>
                        <div className="mt-4 flex items-center gap-1.5 text-sm font-medium transition-all duration-200"
                             style={{ color: cat.accent }}>
                          Browse tools
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

      {/* ── Featured Utility Tools ────────────────────────────── */}
      <section className="px-4 pb-16">
        <div className="mx-auto max-w-[1400px]">
          <motion.div {...fadeUp(0)} className="mb-7">
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-[#10B981]">Popular</p>
            <h2 className="text-2xl font-bold text-[#111827] dark:text-white">Most-used Utility Tools</h2>
          </motion.div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {featuredTools.map((tool, i) => (
              <motion.div key={tool.slug} {...fadeUp(i * 0.04)} whileHover={{ y: -4 }}>
                <Link href={getToolRoutePath(tool)}>
                  <div className="group flex cursor-pointer items-start gap-3 rounded-[18px] border border-border/60 bg-card p-4 transition-all hover:border-[#10B981]/30 hover:shadow-[0_8px_24px_rgba(16,185,129,0.14)]">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#10B981]/10">
                      <Zap className="h-4 w-4 text-[#10B981]" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#111827] dark:text-white">{tool.name}</p>
                      <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-[#6B7280] dark:text-muted-foreground">
                        {tool.description}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-[#10B981] opacity-0 transition-opacity group-hover:opacity-100" />
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
