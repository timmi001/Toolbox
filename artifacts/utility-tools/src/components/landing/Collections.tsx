import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { toolsData } from '@/lib/tools-data';

interface Collection {
  emoji: string;
  name: string;
  description: string;
  href: string;
  categories: string[];
  accent: string;
  bg: string;
}

const COLLECTIONS: Collection[] = [
  {
    emoji: '📄',
    name: 'PDF Tools',
    description: 'Merge, split, compress and convert PDFs',
    href: '/pdf-tools',
    categories: ['pdf'],
    accent: '#EF4444',
    bg: '#FEF2F2',
  },
  {
    emoji: '🖼',
    name: 'Image Tools',
    description: 'Resize, compress and convert images',
    href: '/image-tools',
    categories: ['image'],
    accent: '#F59E0B',
    bg: '#FFFBEB',
  },
  {
    emoji: '🎥',
    name: 'Video Tools',
    description: 'Trim, convert and compress videos',
    href: '/video-tools',
    categories: ['video'],
    accent: '#8B5CF6',
    bg: '#F5F3FF',
  },
  {
    emoji: '🎵',
    name: 'Audio Tools',
    description: 'Merge, trim and convert audio files',
    href: '/audio-tools',
    categories: ['audio'],
    accent: '#EC4899',
    bg: '#FDF2F8',
  },
  {
    emoji: '💻',
    name: 'Developer Tools',
    description: 'JSON, regex, hashing and code helpers',
    href: '/developer-tools',
    categories: ['developer'],
    accent: '#10B981',
    bg: '#ECFDF5',
  },
  {
    emoji: '✍',
    name: 'Text Tools',
    description: 'Word counter, case converter and more',
    href: '/text-tools',
    categories: ['text'],
    accent: '#3B82F6',
    bg: '#EFF6FF',
  },
  {
    emoji: '🧮',
    name: 'Calculators',
    description: 'Finance, health, math and unit tools',
    href: '/calculators',
    categories: ['calculators'],
    accent: '#F97316',
    bg: '#FFF7ED',
  },
  {
    emoji: '📁',
    name: 'File Conversion',
    description: 'Convert between any file format',
    href: '/file-conversion-tools',
    categories: ['file-conversion'],
    accent: '#6B7280',
    bg: '#F9FAFB',
  },
];

export function Collections() {
  return (
    <section className="px-4 py-16">
      <div className="mx-auto max-w-[1400px]">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center"
        >
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#7C3AED]">Collections</p>
          <h2 className="text-3xl font-bold text-[#111827] dark:text-white">Popular Collections</h2>
          <p className="mt-3 text-[#6B7280] dark:text-neutral-400">Everything you need, organised by category</p>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {COLLECTIONS.map((col, i) => {
            const count = toolsData.filter((t) => (col.categories as string[]).includes(t.category)).length;
            return (
              <motion.div
                key={col.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                whileHover={{ y: -6 }}
              >
                <Link href={col.href}>
                  <div className="group relative cursor-pointer overflow-hidden rounded-[22px] border border-border/60 bg-white p-6 transition-all duration-300 hover:border-transparent hover:shadow-[0_16px_48px_rgba(0,0,0,0.10)] dark:bg-card">
                    {/* Subtle bg tint on hover */}
                    <div
                      className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      style={{ background: `linear-gradient(135deg, ${col.bg} 0%, transparent 60%)` }}
                    />
                    <div className="relative">
                      {/* Emoji icon */}
                      <div
                        className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl text-2xl transition-transform duration-300 group-hover:scale-110"
                        style={{ backgroundColor: col.bg }}
                      >
                        {col.emoji}
                      </div>
                      <h3 className="mb-1 font-bold text-[#111827] dark:text-white">{col.name}</h3>
                      <p className="mb-4 text-xs leading-relaxed text-[#6B7280] dark:text-muted-foreground">
                        {col.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span
                          className="rounded-full px-2.5 py-1 text-xs font-semibold"
                          style={{ backgroundColor: `${col.accent}18`, color: col.accent }}
                        >
                          {count} tools
                        </span>
                        <ArrowRight
                          className="h-4 w-4 opacity-0 transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100"
                          style={{ color: col.accent }}
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
