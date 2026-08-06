import { useRoute, Link } from 'wouter';
import { toolsData, ToolCategory } from '@/lib/tools-data';
import { ToolCard } from '@/components/ToolCard';
import { useSEO } from '@/hooks/useSEO';
import { BreadcrumbNav } from '@/components/BreadcrumbNav';
import { Input } from '@/components/ui/input';
import { BookOpen, BrainCircuit, CalendarDays, CheckCircle2, GraduationCap, Search, Sparkles, TrendingUp } from 'lucide-react';
import { useState } from 'react';

const CATEGORY_DETAILS: Record<string, { title: string, desc: string }> = {
  'text-tools': { title: 'Text Tools', desc: 'Format, count, clean, and manipulate text with our comprehensive suite of text utilities.' },
  'developer-tools': { title: 'Developer Tools', desc: 'JSON formatters, encoders, hashes, and essential utilities for developers.' },
  'image-tools': { title: 'Image Tools', desc: 'Compress, crop, resize, and convert images entirely in your browser.' },
  'file-conversion-tools': { title: 'File Conversion Tools', desc: 'Convert documents, archives, spreadsheets, and media formats in a few clicks.' },
  'business-tools': { title: 'Business Tools', desc: 'Create invoices, receipts, labels, business names, and simple financial insights.' },
  'pdf-tools': { title: 'PDF Tools', desc: 'Merge, split, and manipulate PDF documents securely.' },
  'calculators': { title: 'Calculators & Converters', desc: 'Solve math problems, convert units, and calculate dates.' },
  'ai-marketing-advertising': { title: 'AI Marketing & Advertising', desc: 'Create ad copy, sales messaging, landing page content, and conversion-focused CTAs with AI-powered marketing tools.' },
  'audio-tools': { title: 'Audio Tools', desc: 'Record, trim, merge, convert, and enhance audio files entirely in your browser — no installs needed.' },
  'video-tools': { title: 'Video Tools', desc: 'Trim, merge, compress, rotate, subtitle, and convert videos with simple browser-based tools.' },
  'ai-resume-tools': { title: 'AI Resume Tools', desc: 'Build resumes, cover letters, LinkedIn headlines, and professional bios with AI.' },
  'ai-social-media-tools': { title: 'AI Social Media Tools', desc: 'Generate captions, posts, and descriptions for Instagram, X, TikTok, LinkedIn, and YouTube.' },
  'ai-blogging-seo-tools': { title: 'AI Blogging & SEO Tools', desc: 'Write blog titles, outlines, articles, and SEO meta tags with AI.' },
  'ai-email-tools': { title: 'AI Email Tools', desc: 'Draft cold emails, sales emails, follow-ups, support replies, and thank-you notes.' },
  'ai-grammar-tools': { title: 'AI Grammar & Writing Tools', desc: 'Check grammar, improve tone, summarize, paraphrase, and proofread any text.' },
  'ai-study-exams-tools': { title: 'AI Study & Exams', desc: 'Turn any topic into a guided revision flow with notes, quizzes, flashcards, planners, and exam-style practice tools.' },
  'ai-ghostwriting-tools': { title: 'AI Ghostwriting', desc: 'Create polished essays, stories, book outlines, chapters, and speeches with a guided writing workflow.' },
  'ai-event-tools': { title: 'AI Event Planning', desc: 'Plan birthdays, weddings, launches, and work events with AI-assisted itineraries, checklists, and invite copy.' },
};

const STUDY_HIGHLIGHTS = [
  { title: 'Study notes in minutes', description: 'Turn a topic into clean revision notes you can review fast.', slug: 'ai-study-notes', icon: BookOpen },
  { title: 'Practice mode', description: 'Generate quizzes and mock questions that feel like a real exam.', slug: 'ai-quiz-generator', icon: BrainCircuit },
  { title: 'Flashcards that stick', description: 'Build compact flashcards for memorization and quick drills.', slug: 'ai-flashcard-generator', icon: Sparkles },
  { title: 'Plan your prep', description: 'Map out revision blocks, milestones, and deadlines with a study planner.', slug: 'ai-study-planner', icon: CalendarDays },
  { title: 'Track progress', description: 'Use analytics-style summaries to see what needs more attention.', slug: 'ai-homework-helper', icon: TrendingUp },
  { title: 'Tutor-style support', description: 'Break down tricky problems and assignments step by step.', slug: 'ai-math-solver', icon: GraduationCap },
] as const;

export default function CategoryPage() {
  const [match, params] = useRoute('/:category');
  const [search, setSearch] = useState('');

  const categoryPath = params?.category ?? '';
  const details = CATEGORY_DETAILS[categoryPath];

  const mappedCategory: ToolCategory =
    categoryPath === 'text-tools' ? 'text' :
    categoryPath === 'developer-tools' ? 'developer' :
    categoryPath === 'image-tools' ? 'image' :
    categoryPath === 'file-conversion-tools' ? 'file-conversion' :
    categoryPath === 'business-tools' ? 'business' :
    categoryPath === 'pdf-tools' ? 'pdf' :
    categoryPath === 'ai-marketing-advertising' ? 'marketing' :
    categoryPath === 'audio-tools' ? 'audio' :
    categoryPath === 'video-tools' ? 'video' :
    categoryPath === 'ai-resume-tools' ? 'ai-resume' :
    categoryPath === 'ai-social-media-tools' ? 'ai-social' :
    categoryPath === 'ai-blogging-seo-tools' ? 'ai-blogging-seo' :
    categoryPath === 'ai-email-tools' ? 'ai-email' :
    categoryPath === 'ai-grammar-tools' ? 'ai-grammar' :
    categoryPath === 'ai-study-exams-tools' ? 'ai-study-exams' :
    categoryPath === 'ai-ghostwriting-tools' ? 'ai-ghostwriting' :
    categoryPath === 'ai-event-tools' ? 'ai-events' :
    'calculators';

  useSEO(
    details ? `${details.title} | ToolKit` : 'ToolKit',
    details?.desc ?? ''
  );

  if (!match || !categoryPath) return null;
  if (!details) return <div>Category not found</div>;

  const categoryTools = toolsData.filter(t => t.category === mappedCategory);

  const filteredTools = categoryTools.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.description.toLowerCase().includes(search.toLowerCase())
  );

  const isStudyExams = categoryPath === 'ai-study-exams-tools';

  return (
    <div className="py-5 animate-in fade-in duration-500">
      <BreadcrumbNav category={mappedCategory} />

      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1.5">{details.title}</h1>
        <p className="text-sm text-muted-foreground mb-4 max-w-2xl">{details.desc}</p>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${categoryTools.length} ${details.title.toLowerCase()}...`}
            className="pl-9 bg-card border-border/50 h-9 text-sm"
          />
        </div>
      </header>

      {isStudyExams && (
        <div className="mb-8 space-y-4">
          <section className="rounded-[24px] border border-border/70 bg-gradient-to-br from-[#0891B2]/12 via-white/70 to-[#7C3AED]/10 p-6 shadow-sm dark:bg-card/70">
            <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-[#0891B2]">
              <GraduationCap className="h-4 w-4" />
              Exam prep hub
            </div>
            <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">Turn every revision session into a guided study sprint.</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Build notes, generate quizzes, review flashcards, and structure a study plan in one place so prep feels focused instead of scattered.
                </p>
              </div>
              <div className="grid gap-2 sm:grid-cols-3">
                {[
                  { label: 'Study tools', value: `${categoryTools.length}+` },
                  { label: 'Prep modes', value: '5' },
                  { label: 'Focus areas', value: '24/7' },
                ].map(stat => (
                  <div key={stat.label} className="rounded-2xl border border-border/60 bg-background/80 px-3 py-3 text-center">
                    <p className="text-lg font-semibold text-foreground">{stat.value}</p>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <section className="rounded-[22px] border border-border/70 bg-card/70 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Popular study modes</h3>
                <span className="rounded-full border border-border/60 bg-muted/40 px-2.5 py-1 text-xs font-medium text-muted-foreground">Built for revision</span>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {STUDY_HIGHLIGHTS.map(item => {
                  const Icon = item.icon;
                  return (
                    <Link key={item.slug} href={`/tools/ai/${item.slug}`}>
                      <div className="group flex cursor-pointer items-start gap-3 rounded-2xl border border-border/60 bg-background/60 p-3 transition hover:border-primary/40 hover:shadow-sm">
                        <div className="rounded-xl bg-primary/10 p-2 text-primary">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{item.title}</p>
                          <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>

            <section className="rounded-[22px] border border-border/70 bg-card/70 p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-foreground">What this experience covers</h3>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> Generate notes, quizzes, flashcards, and study plans from a single topic.</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> Mix quick review sessions with deeper homework help and tutor-style explanations.</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> Keep prep structured with milestone-based revision and exam-style practice.</li>
              </ul>
            </section>
          </div>
        </div>
      )}

      {filteredTools.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
          {filteredTools.map(tool => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-muted-foreground">
          No tools found matching "{search}".
        </div>
      )}
    </div>
  );
}
