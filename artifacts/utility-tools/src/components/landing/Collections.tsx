import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { toolsData } from '@/lib/tools-data';

const ALL_COLLECTIONS = [
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

export function Collections() {
  return (
    <section className="px-4 py-7 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1400px]">

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mb-4"
        >
          <p className="mb-0.5 text-xs font-semibold uppercase tracking-widest text-[#4B0082]">Browse</p>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Tool Categories</h2>
        </motion.div>

        {/* 4 cols on sm+, 8 cols on lg+ — compact icon-chip style */}
        <div className="grid grid-cols-4 gap-2.5 sm:grid-cols-4 lg:grid-cols-8">
          {ALL_COLLECTIONS.map((col, i) => {
            const count = toolsData.filter((t) => col.categories.includes(t.category)).length;
            return (
              <motion.div
                key={col.name}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.035 }}
                whileHover={{ y: -3 }}
              >
                <Link href={col.href}>
                  <div
                    className="group cursor-pointer overflow-hidden rounded-xl p-2.5 text-center transition-all duration-200 hover:shadow-[0_6px_20px_rgba(0,0,0,0.09)]"
                    style={{ background: col.gradient }}
                  >
                    <div className="mb-1 text-2xl transition-transform duration-200 group-hover:scale-110 leading-none">
                      {col.emoji}
                    </div>
                    <p className="text-[11px] font-bold leading-tight text-gray-900 dark:text-gray-800">
                      {col.name}
                    </p>
                    <p className="mt-0.5 text-[10px] font-medium" style={{ color: col.accent }}>
                      {count} tools
                    </p>
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
