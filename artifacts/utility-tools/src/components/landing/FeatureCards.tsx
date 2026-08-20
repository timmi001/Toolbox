import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowRight, Bot, Wrench } from 'lucide-react';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] },
});

const AI_TOOLS = ['AI Chat', 'AI Resume Builder', 'AI Marketing', 'AI Email Generator'];
const UTIL_TOOLS = ['PDF Merge', 'QR Generator', 'Image Converter', 'Calculator'];

export function FeatureCards() {
  return (
    <section className="px-4 py-4">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-5 md:grid-cols-2">

        {/* AI Tools card — purple */}
        <motion.div
          {...fadeUp(0)}
          whileHover={{ y: -6 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative overflow-hidden rounded-[24px] p-8 text-white"
          style={{
            background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 50%, #4C1D95 100%)',
            boxShadow: '0 24px 60px rgba(124,58,237,0.30)',
          }}
        >
          {/* Decorative glow */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-[#9F67FF]/30 blur-2xl" />

          <div className="relative">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <h3 className="mb-2 text-2xl font-bold">🤖 AI Tools</h3>
            <p className="mb-6 text-white/75 leading-relaxed">
              Powerful AI tools for writing, coding, studying, business and productivity.
            </p>
            <ul className="mb-8 space-y-2">
              {AI_TOOLS.map((t) => (
                <li key={t} className="flex items-center gap-2.5 text-sm text-white/85">
                  <span className="h-1 w-1 rounded-full bg-white/60" />
                  {t}
                </li>
              ))}
            </ul>
            <Link href="/ai-tools">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-black/20 ring-1 ring-white/20 transition-all hover:bg-white/20 hover:shadow-xl"
              >
                Explore AI Tools
                <ArrowRight className="h-4 w-4" />
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Utility Tools card — emerald */}
        <motion.div
          {...fadeUp(0.1)}
          whileHover={{ y: -6 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative overflow-hidden rounded-[24px] p-8 text-white"
          style={{
            background: 'linear-gradient(135deg, #10B981 0%, #059669 50%, #047857 100%)',
            boxShadow: '0 24px 60px rgba(16,185,129,0.28)',
          }}
        >
          {/* Decorative glow */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />

          <div className="relative">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
              <Wrench className="h-6 w-6 text-white" />
            </div>
            <h3 className="mb-2 text-2xl font-bold">🛠 Utility Tools</h3>
            <p className="mb-6 text-white/75 leading-relaxed">
              Everyday tools for PDFs, files, developers, media and calculations.
            </p>
            <ul className="mb-8 space-y-2">
              {UTIL_TOOLS.map((t) => (
                <li key={t} className="flex items-center gap-2.5 text-sm text-white/85">
                  <span className="h-1 w-1 rounded-full bg-white/60" />
                  {t}
                </li>
              ))}
            </ul>
            <Link href="/">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-black/20 ring-1 ring-white/20 transition-all hover:bg-white/20 hover:shadow-xl"
              >
                Explore Utility Tools
                <ArrowRight className="h-4 w-4" />
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
