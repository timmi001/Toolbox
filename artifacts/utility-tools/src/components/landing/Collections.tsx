import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { toolsData } from '@/lib/tools-data';

interface Collection {
  emoji: string;
  name: string;
  href: string;
  categories: string[];
  gradient: string;
  accent: string;
}

const ALL_COLLECTIONS: Collection[] = [
  {
    emoji: '📄',
    name: 'PDF Tools',
    href: '/pdf-tools',
    categories: ['pdf'],
    gradient: 'linear-gradient(135deg, #FEF2F2 0%, #FECACA 100%)',
    accent: '#EF4444',
  },
  {
    emoji: '🖼',
    name: 'Image Tools',
    href: '/image-tools',
    categories: ['image'],
    gradient: 'linear-gradient(135deg, #FFFBEB 0%, #FDE68A 100%)',
    accent: '#F59E0B',
  },
  {
    emoji: '🎥',
    name: 'Video Tools',
    href: '/video-tools',
    categories: ['video'],
    gradient: 'linear-gradient(135deg, #F5F3FF 0%, #DDD6FE 100%)',
    accent: '#7C3AED',
  },
  {
    emoji: '🎵',
    name: 'Audio Tools',
    href: '/audio-tools',
    categories: ['audio'],
    gradient: 'linear-gradient(135deg, #FDF2F8 0%, #FBCFE8 100%)',
    accent: '#EC4899',
  },
  {
    emoji: '💻',
    name: 'Developer Tools',
    href: '/developer-tools',
    categories: ['developer'],
    gradient: 'linear-gradient(135deg, #ECFDF5 0%, #A7F3D0 100%)',
    accent: '#10B981',
  },
  {
    emoji: '✍',
    name: 'Text Tools',
    href: '/text-tools',
    categories: ['text'],
    gradient: 'linear-gradient(135deg, #EFF6FF 0%, #BFDBFE 100%)',
    accent: '#3B82F6',
  },
  {
    emoji: '🧮',
    name: 'Calculators',
    href: '/calculators',
    categories: ['calculators'],
    gradient: 'linear-gradient(135deg, #FFF7ED 0%, #FED7AA 100%)',
    accent: '#F97316',
  },
  {
    emoji: '📁',
    name: 'File Conversion',
    href: '/file-conversion-tools',
    categories: ['file-conversion'],
    gradient: 'linear-gradient(135deg, #F9FAFB 0%, #E5E7EB 100%)',
    accent: '#6B7280',
  },
];

const ROTATION_INTERVAL_MS = 60_000;
const VISIBLE_COUNT = 3;

export function Collections() {
  const [offset, setOffset] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = back

  useEffect(() => {
    const id = setInterval(() => {
      setDirection(1);
      setOffset((prev) => (prev + VISIBLE_COUNT) % ALL_COLLECTIONS.length);
    }, ROTATION_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  const visible = Array.from({ length: VISIBLE_COUNT }, (_, i) =>
    ALL_COLLECTIONS[(offset + i) % ALL_COLLECTIONS.length]
  );

  return (
    <section className="px-4 py-16">
      <div className="mx-auto max-w-[1400px]">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#4B0082]">Collections</p>
          <div className="flex items-end justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Discover Tools</h2>
            {/* Dot indicators */}
            <div className="flex gap-1.5">
              {Array.from({ length: Math.ceil(ALL_COLLECTIONS.length / VISIBLE_COUNT) }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setDirection(i * VISIBLE_COUNT > offset ? 1 : -1); setOffset(i * VISIBLE_COUNT); }}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    Math.floor(offset / VISIBLE_COUNT) === i ? 'w-6 bg-[#4B0082]' : 'w-1.5 bg-gray-300'
                  }`}
                  aria-label={`Go to page ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Cards row */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <AnimatePresence mode="wait">
            {visible.map((col) => {
              const count = toolsData.filter((t) => col.categories.includes(t.category)).length;
              return (
                <motion.div
                  key={col.name + offset}
                  initial={{ opacity: 0, y: 20 * direction }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 * direction }}
                  transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -6 }}
                >
                  <Link href={col.href}>
                    <div
                      className="group relative cursor-pointer overflow-hidden rounded-[24px] p-6 transition-all duration-300 hover:shadow-[0_20px_56px_rgba(0,0,0,0.12)]"
                      style={{ background: col.gradient }}
                    >
                      {/* "Discover Tools" label */}
                      <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-500">
                        Discover Tools
                      </p>

                      {/* Large icon */}
                      <div className="mb-4 text-5xl transition-transform duration-300 group-hover:scale-110">
                        {col.emoji}
                      </div>

                      {/* Title */}
                      <h3 className="mb-1 text-xl font-bold text-gray-900">{col.name}</h3>

                      {/* Slightly wrong count phrasing — as specified */}
                      <p className="mb-6 text-sm text-gray-600">
                        {count} {col.name} Tools
                      </p>

                      {/* Explore button */}
                      <div className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition-all group-hover:bg-[#4B0082]">
                        Explore
                        <span style={{ color: col.accent }}>→</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
