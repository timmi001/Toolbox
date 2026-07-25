import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowRight, Bot, Wrench, Zap } from 'lucide-react';

const AI_HIGHLIGHTS = ['AI Grammar & Writing', 'AI Resume Builder', 'AI Marketing', 'AI Email Generator'];
const UTIL_HIGHLIGHTS = ['PDF Tools', 'Image Converter', 'Developer Tools', 'Calculators'];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] },
});

export function Hero() {
  return (
    <section
      className="w-full px-4 pb-12 pt-10 sm:px-6 lg:px-8"
      style={{
        background: 'linear-gradient(135deg, #F3E8FF 0%, #EDE9FE 45%, #F0FDF4 100%)',
      }}
    >
      <div className="mx-auto max-w-[1400px]">

        {/* Badge + headline */}
        <motion.div {...fadeUp(0)} className="mb-10 text-center">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#4B0082]/20 bg-white/80 px-4 py-1.5 text-sm font-medium text-[#4B0082] shadow-sm backdrop-blur-sm">
            <Zap className="h-3.5 w-3.5" />
            200+ free tools — no sign up required
          </span>
          <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            AI That Works.{' '}
            <span className="bg-gradient-to-r from-[#4B0082] via-[#7C3AED] to-[#10B981] bg-clip-text text-transparent">
              Tools That Save Time.
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-gray-600">
            200+ free AI and utility tools for creators, students, developers and businesses.
          </p>
        </motion.div>

        {/* Feature cards — side by side */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

          {/* AI Tools — deep purple */}
          <motion.div
            {...fadeUp(0.1)}
            whileHover={{ y: -6, transition: { duration: 0.22, ease: 'easeOut' } }}
            className="relative overflow-hidden rounded-[26px] p-8 text-white"
            style={{
              background: 'linear-gradient(135deg, #4B0082 0%, #7C3AED 65%, #5B21B6 100%)',
              boxShadow: '0 24px 64px rgba(75,0,130,0.32)',
            }}
          >
            {/* Decorative glows */}
            <div className="pointer-events-none absolute -right-12 -top-12 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-10 left-1/3 h-40 w-40 rounded-full bg-purple-300/20 blur-2xl" />

            <div className="relative">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-2 text-2xl font-bold">🤖 AI Tools</h3>
              <p className="mb-6 leading-relaxed text-white/75">
                Powerful AI tools for writing, coding, studying, business and productivity.
              </p>
              <ul className="mb-8 space-y-2.5">
                {AI_HIGHLIGHTS.map((t) => (
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
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-[#4B0082] shadow-lg shadow-black/20 transition-all hover:shadow-xl"
                >
                  Explore AI Tools
                  <ArrowRight className="h-4 w-4" />
                </motion.button>
              </Link>
            </div>
          </motion.div>

          {/* Utility Tools — emerald */}
          <motion.div
            {...fadeUp(0.18)}
            whileHover={{ y: -6, transition: { duration: 0.22, ease: 'easeOut' } }}
            className="relative overflow-hidden rounded-[26px] p-8 text-white"
            style={{
              background: 'linear-gradient(135deg, #059669 0%, #10B981 65%, #047857 100%)',
              boxShadow: '0 24px 64px rgba(5,150,105,0.30)',
            }}
          >
            {/* Decorative glows */}
            <div className="pointer-events-none absolute -right-12 -top-12 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-10 left-1/3 h-40 w-40 rounded-full bg-emerald-200/20 blur-2xl" />

            <div className="relative">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
                <Wrench className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-2 text-2xl font-bold">🛠 Utility Tools</h3>
              <p className="mb-6 leading-relaxed text-white/75">
                Everyday tools for PDFs, files, developers, media and calculations.
              </p>
              <ul className="mb-8 space-y-2.5">
                {UTIL_HIGHLIGHTS.map((t) => (
                  <li key={t} className="flex items-center gap-2.5 text-sm text-white/85">
                    <span className="h-1 w-1 rounded-full bg-white/60" />
                    {t}
                  </li>
                ))}
              </ul>
              <Link href="/utility-tools">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-[#059669] shadow-lg shadow-black/20 transition-all hover:shadow-xl"
                >
                  Explore Utility Tools
                  <ArrowRight className="h-4 w-4" />
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
