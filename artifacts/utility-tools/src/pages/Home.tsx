import { Link } from 'wouter';
import { ArrowRight, BadgeCheck, Clock3, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import { SearchBar } from '@/components/SearchBar';
import { CategoryGrid } from '@/components/CategoryGrid';
import { ToolFAQ } from '@/components/ToolFAQ';
import { getToolRoutePath, toolsData } from '@/lib/tools-data';

const HOME_FAQS = [
  { question: 'Are these tools really free?', answer: 'Yes, 100% free forever. No premium tiers, no hidden costs.' },
  { question: 'Is my data secure?', answer: 'Absolutely. All tools run client-side in your browser. Your data never leaves your device.' },
  { question: 'Do I need to create an account?', answer: 'No account required. Just open the tool and start using it immediately.' },
  { question: 'Are there any usage limits?', answer: 'No limits. Use any tool as many times as you need.' }
];

const FEATURED_TOOLS = [...toolsData]
  .filter((tool) => tool.popular || tool.trending || tool.new)
  .slice(0, 6);

export default function Home() {
  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-700">
      <section className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-gradient-to-br from-background via-card/80 to-background/70 p-6 shadow-[0_30px_80px_-40px_hsl(var(--primary)/0.35)] sm:p-8 lg:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.28),_transparent_55%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.12),_transparent_55%)]" />
        <div className="relative grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              Premium utilities, designed to feel effortless
            </div>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Turn any task into a fast, polished workflow.
            </h1>
            <p className="mt-4 max-w-xl text-lg text-muted-foreground sm:text-xl">
              Search, launch, and complete everyday tasks with a curated collection of AI tools, dev helpers, and productivity utilities — all running in your browser.
            </p>

            <div className="mt-6 flex flex-wrap gap-2 text-sm text-muted-foreground">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-1.5">
                <ShieldCheck className="h-4 w-4 text-primary" />
                100% privacy-first
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-1.5">
                <Zap className="h-4 w-4 text-primary" />
                Instant access
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-1.5">
                <Clock3 className="h-4 w-4 text-primary" />
                No sign-up required
              </div>
            </div>

            <div className="mt-8 max-w-2xl">
              <SearchBar />
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-border/70 bg-background/70 p-4 shadow-inner sm:p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">Popular right now</p>
                <p className="text-sm text-muted-foreground">A few favorites worth trying first</p>
              </div>
              <Link href="/text-tools" className="text-sm font-medium text-primary transition-colors hover:text-primary/80">
                Browse all
              </Link>
            </div>
            <div className="grid gap-3">
              {FEATURED_TOOLS.map((tool) => (
                <Link key={tool.slug} href={getToolRoutePath(tool)} className="group rounded-2xl border border-border/60 bg-card/70 p-3 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-card">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{tool.name}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{tool.description}</p>
                    </div>
                    <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">Explore tools</p>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">Find your next favorite utility</h2>
          </div>
          <p className="text-sm text-muted-foreground">Everything is organized into elegant, focused categories.</p>
        </div>
        <CategoryGrid />
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[1.5rem] border border-border/70 bg-card/60 p-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            <BadgeCheck className="h-4 w-4" />
            Built for everyday momentum
          </div>
          <h3 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">Fast, calm, and genuinely useful.</h3>
          <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
            <li className="rounded-2xl border border-border/60 bg-background/60 p-3">Clean, distraction-free workflows with no account friction.</li>
            <li className="rounded-2xl border border-border/60 bg-background/60 p-3">Smart search that surfaces the right tool before you even finish typing.</li>
            <li className="rounded-2xl border border-border/60 bg-background/60 p-3">Private-by-default operations that stay in your browser.</li>
          </ul>
        </div>
        <div className="rounded-[1.5rem] border border-border/70 bg-gradient-to-br from-primary/10 via-background to-background p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">Why it works</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">Built around momentum, not clutter.</h3>
            </div>
            <div className="rounded-2xl border border-primary/20 bg-background/70 px-3 py-2 text-right">
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Starting point</p>
              <p className="text-lg font-semibold text-foreground">One search box</p>
            </div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {[
              ['AI writing', 'Summaries, rewrites, copy, and ideas in seconds.'],
              ['Developer helpers', 'Format, validate, transform, and inspect code quickly.'],
              ['PDF and media', 'Convert, combine, and optimize your files without friction.'],
              ['Calculators', 'Handle everyday math and conversions in a clean experience.']
            ].map(([title, desc]) => (
              <div key={title} className="rounded-2xl border border-border/60 bg-background/70 p-4">
                <p className="font-semibold text-foreground">{title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto">
        <ToolFAQ faqs={HOME_FAQS} />
      </section>
    </div>
  );
}
