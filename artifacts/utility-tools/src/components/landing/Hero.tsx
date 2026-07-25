import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowRight, Bot, Wrench, Zap } from 'lucide-react';

const AI_HIGHLIGHTS = ['AI Grammar & Writing', 'AI Resume Builder', 'AI Marketing', 'AI Email Generator'];
const UTIL_HIGHLIGHTS = ['PDF Tools', 'Image Converter', 'Developer Tools', 'Calculators'];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fadeUp = (delay = 0): any => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] },
});

export function Hero() {
  return (
    <section
      className="w-full px-4 pb-6 pt-5 sm:px-6 lg:px-8"
      style={{
        background: 'linear-gradient(135deg, #F3E8FF 0%, #EDE9FE 45%, #F0FDF4 100%)',
      }}
    >
      <div className="mx-auto max-w-[1400px]">

        {/* Badge */}
        <motion.div {...fadeUp(0)} className="mb-5 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#4B0082]/20 bg-white/80 px-4 py-1.5 text-sm font-medium text-[#4B0082] shadow-sm backdrop-blur-sm">
            <Zap className="h-3.5 w-3.5" />
            200+ free tools — no sign up required
          </span>
        </motion.div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

          {/* AI Tools */}
          <motion.div
            {...fadeUp(0.08)}
            whileHover={{ y: -4, transition: { duration: 0.2, ease: 'easeOut' } }}
            className="relative overflow-hidden rounded-2xl p-5 text-white"
            style={{
              background: 'linear-gradient(135deg, #4B0082 0%, #7C3AED 65%, #5B21B6 100%)',
              boxShadow: '0 16px 48px rgba(75,0,130,0.26)',
            }}
          >
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-8 left-1/3 h-28 w-28 rounded-full bg-purple-300/20 blur-2xl" />
            <div className="relative">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
                <Bot className="h-4.5 w-4.5 text-white" />
              </div>
              <h3 className="mb-1.5 text-xl font-bold">🤖 AI Tools</h3>
              <p className="mb-4 text-sm leading-relaxed text-white/75">
                Powerful AI tools for writing, coding, studying, business and productivity.
              </p>
              <ul className="mb-5 space-y-1.5">
                {AI_HIGHLIGHTS.map((t) => (
                  <li key={t} className="flex items-center gap-2 text-sm text-white/85">
                    <span className="h-1 w-1 rounded-full bg-white/60" />
                    {t}
                  </li>
                ))}
              </ul>
              <Link href="/ai-tools">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-[#4B0082] shadow-lg shadow-black/20 transition-all hover:shadow-xl"
                >
                  Explore AI Tools
                  <ArrowRight className="h-3.5 w-3.5" />
                </motion.button>
              </Link>
            </div>
          </motion.div>

          {/* Utility Tools */}
          <motion.div
            {...fadeUp(0.16)}
            whileHover={{ y: -4, transition: { duration: 0.2, ease: 'easeOut' } }}
            className="relative overflow-hidden rounded-2xl p-5 text-white"
            style={{
              background: 'linear-gradient(135deg, #059669 0%, #10B981 65%, #047857 100%)',
              boxShadow: '0 16px 48px rgba(5,150,105,0.24)',
            }}
          >
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-8 left-1/3 h-28 w-28 rounded-full bg-emerald-200/20 blur-2xl" />
            <div className="relative">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
                <Wrench className="h-4.5 w-4.5 text-white" />
              </div>
              <h3 className="mb-1.5 text-xl font-bold">🛠 Utility Tools</h3>
              <p className="mb-4 text-sm leading-relaxed text-white/75">
                Everyday tools for PDFs, files, developers, media and calculations.
              </p>
              <ul className="mb-5 space-y-1.5">
                {UTIL_HIGHLIGHTS.map((t) => (
                  <li key={t} className="flex items-center gap-2 text-sm text-white/85">
                    <span className="h-1 w-1 rounded-full bg-white/60" />
                    {t}
                  </li>
                ))}
              </ul>
              <Link href="/utility-tools">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-[#059669] shadow-lg shadow-black/20 transition-all hover:shadow-xl"
                >
                  Explore Utility Tools
                  <ArrowRight className="h-3.5 w-3.5" />
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
