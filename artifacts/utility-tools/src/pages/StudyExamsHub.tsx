import { useEffect, useMemo, useState } from 'react';
import { Link } from 'wouter';
import { ArrowRight, BarChart3, BookOpen, BrainCircuit, CalendarDays, CheckCircle2, Clock3, GraduationCap, Layers, Lightbulb, MessageSquareQuote, Search, Sparkles, Target, Trophy, Upload } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useSEO } from '@/hooks/useSEO';

type StudyModule = {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  accentClass: string;
  tags: string[];
};

const STUDY_MODULES: StudyModule[] = [
  {
    id: 'notes',
    title: 'Study notes',
    description: 'Turn any topic into revision-ready notes with clear sections and summary bullets.',
    href: '/tools/ai/ai-study-notes',
    icon: BookOpen,
    accentClass: 'border-[#7C3AED]/15 bg-gradient-to-br from-[#7C3AED]/10 to-transparent',
    tags: ['revision', 'fast prep'],
  },
  {
    id: 'quiz',
    title: 'Practice questions',
    description: 'Generate mixed-difficulty quizzes and instant answer explanations for active recall.',
    href: '/tools/ai/ai-quiz-generator',
    icon: BrainCircuit,
    accentClass: 'border-[#2563EB]/15 bg-gradient-to-br from-[#2563EB]/10 to-transparent',
    tags: ['exam drills', 'active recall'],
  },
  {
    id: 'flashcards',
    title: 'Flashcards',
    description: 'Build memorization cards for formulas, vocabulary, definitions, and key concepts.',
    href: '/tools/ai/ai-flashcard-generator',
    icon: Layers,
    accentClass: 'border-[#059669]/15 bg-gradient-to-br from-[#059669]/10 to-transparent',
    tags: ['memorization', 'spaced repetition'],
  },
  {
    id: 'planner',
    title: 'Revision planner',
    description: 'Map out study blocks, deadlines, and milestone check-ins with a smart weekly plan.',
    href: '/tools/ai/ai-study-planner',
    icon: CalendarDays,
    accentClass: 'border-[#DC2626]/15 bg-gradient-to-br from-[#DC2626]/10 to-transparent',
    tags: ['schedule', 'milestones'],
  },
  {
    id: 'homework',
    title: 'Homework helper',
    description: 'Break assignments into step-by-step guidance, examples, and simplified explanations.',
    href: '/tools/ai/ai-homework-helper',
    icon: GraduationCap,
    accentClass: 'border-[#0F766E]/15 bg-gradient-to-br from-[#0F766E]/10 to-transparent',
    tags: ['steps', 'support'],
  },
  {
    id: 'tutor',
    title: 'AI tutor',
    description: 'Get focused help for tricky topics, formulas, equations, and concept breakdowns.',
    href: '/tools/ai/ai-math-solver',
    icon: Lightbulb,
    accentClass: 'border-[#7C3AED]/15 bg-gradient-to-br from-[#F59E0B]/10 to-transparent',
    tags: ['tutor', 'concepts'],
  },
  {
    id: 'interview',
    title: 'Interview practice',
    description: 'Prepare for school, internships, and career interviews with realistic questions.',
    href: '/tools/ai/ai-interview-practice',
    icon: MessageSquareQuote,
    accentClass: 'border-[#EC4899]/15 bg-gradient-to-br from-[#EC4899]/10 to-transparent',
    tags: ['career prep', 'confidence'],
  },
  {
    id: 'dashboard',
    title: 'Progress dashboard',
    description: 'Track weak spots, priorities, and mastered topics in one view that feels like a study cockpit.',
    href: '/tools/ai/ai-study-planner',
    icon: BarChart3,
    accentClass: 'border-[#F59E0B]/15 bg-gradient-to-br from-[#F59E0B]/10 to-transparent',
    tags: ['analytics', 'focus'],
  },
];

const EXAM_CATEGORIES = ['SAT / ACT', 'Medical exams', 'Law school', 'Engineering', 'Business', 'Language learning', 'Coding interviews'];

const quickHighlights = [
  { label: '40+ study workflows', icon: Sparkles },
  { label: 'Multi-subject support', icon: BookOpen },
  { label: 'Searchable workspace', icon: Search },
];

export default function StudyExamsHub() {
  useSEO('AI Study & Exams Hub | ToolKit', 'A premium AI-powered study workspace for notes, quizzes, flashcards, revision plans, and exam prep inside ToolboxX.');

  const [search, setSearch] = useState('');
  const [workspace, setWorkspace] = useState<string[]>([]);

  useEffect(() => {
    const saved = window.localStorage.getItem('toolbox-study-workspace');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as string[];
        setWorkspace(parsed);
      } catch {
        window.localStorage.removeItem('toolbox-study-workspace');
      }
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem('toolbox-study-workspace', JSON.stringify(workspace));
  }, [workspace]);

  const filteredModules = useMemo(() => {
    const q = search.toLowerCase();
    return STUDY_MODULES.filter(module =>
      module.title.toLowerCase().includes(q) ||
      module.description.toLowerCase().includes(q) ||
      module.tags.some(tag => tag.toLowerCase().includes(q))
    );
  }, [search]);

  const workspaceModules = STUDY_MODULES.filter(module => workspace.includes(module.id));

  const toggleWorkspace = (moduleId: string) => {
    setWorkspace(current => current.includes(moduleId)
      ? current.filter(id => id !== moduleId)
      : [...current, moduleId]);
  };

  return (
    <div className="pb-10">
      <section className="relative overflow-hidden rounded-[30px] border border-[#7C3AED]/15 bg-gradient-to-br from-[#7C3AED]/10 via-white to-[#2563EB]/10 p-6 shadow-[0_20px_60px_rgba(124,58,237,0.08)] dark:bg-card sm:p-8">
        <div className="absolute inset-y-0 right-0 hidden w-1/3 rounded-full bg-[radial-gradient(circle,_rgba(124,58,237,0.18)_0%,_transparent_65%)] lg:block" />
        <div className="relative max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#7C3AED]/20 bg-white/80 px-3 py-1 text-sm font-medium text-[#7C3AED] dark:bg-card/80">
            <GraduationCap className="h-4 w-4" />
            AI Study & Exams Hub
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Premium study workflows for notes, revision, practice, and exam readiness.
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
            Keep every study sprint inside ToolboxX with AI-powered notes, quizzes, flashcards, planners, tutoring support, and a workspace that stays with you.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {quickHighlights.map((item, index) => {
              const Icon = item.icon;
              return (
                <span key={item.label} className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-white/85 px-3 py-1.5 text-sm text-muted-foreground dark:bg-card/80" style={{ animationDelay: `${index * 70}ms` }}>
                  <Icon className="h-4 w-4 text-[#7C3AED]" />
                  {item.label}
                </span>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[24px] border border-border/60 bg-white p-4 shadow-sm dark:bg-card sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#7C3AED]">Search modules</p>
              <h2 className="text-xl font-semibold text-foreground">Choose your next study move</h2>
            </div>
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={event => setSearch(event.target.value)}
                placeholder="Search notes, quizzes, planning..."
                className="w-full rounded-2xl border border-border/60 bg-background py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-[#7C3AED]/40 focus:ring-2 focus:ring-[#7C3AED]/10"
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {EXAM_CATEGORIES.map(category => (
              <span key={category} className="rounded-full border border-[#7C3AED]/15 bg-[#7C3AED]/8 px-3 py-1 text-sm text-[#7C3AED]">
                {category}
              </span>
            ))}
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {filteredModules.map(module => {
              const Icon = module.icon;
              const selected = workspace.includes(module.id);
              return (
                <div key={module.id} className={`rounded-[20px] border p-4 transition-all ${module.accentClass}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/80 shadow-sm dark:bg-card/80">
                      <Icon className="h-5 w-5 text-[#7C3AED]" />
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleWorkspace(module.id)}
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${selected ? 'bg-[#7C3AED] text-white' : 'bg-white/80 text-[#7C3AED] dark:bg-card/80'}`}
                    >
                      {selected ? 'Saved' : 'Save'}
                    </button>
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-foreground">{module.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{module.description}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {module.tags.map(tag => (
                      <span key={tag} className="rounded-full border border-border/60 bg-white/70 px-2.5 py-1 text-xs text-muted-foreground dark:bg-card/70">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <Link href={module.href}>
                    <a className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#7C3AED] hover:gap-3 transition-all">
                      Open module
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  </Link>
                </div>
              );
            })}
          </div>

          {filteredModules.length === 0 && (
            <div className="mt-5 rounded-2xl border border-dashed border-border/60 bg-background/70 p-8 text-center text-sm text-muted-foreground">
              No study modules match your search yet.
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-[24px] border border-border/60 bg-gradient-to-br from-[#111827] to-[#1f2937] p-5 text-white shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-[#A78BFA]">
              <Target className="h-4 w-4" />
              Saved workspace
            </div>
            <h3 className="mt-3 text-xl font-semibold">Your study command center</h3>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Keep your most useful modules close at hand for focused revision and exam prep.
            </p>

            <div className="mt-4 space-y-2">
              {workspaceModules.length > 0 ? workspaceModules.map(module => (
                <div key={module.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/10 px-3 py-2.5 text-sm">
                  <span>{module.title}</span>
                  <Link href={module.href}>
                    <a className="font-semibold text-[#A78BFA]">Open</a>
                  </Link>
                </div>
              )) : (
                <div className="rounded-2xl border border-dashed border-white/20 bg-white/10 p-3 text-sm text-slate-300">
                  Save a few modules to build a personalized study flow.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[24px] border border-border/60 bg-white p-5 shadow-sm dark:bg-card">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-[#059669]">
              <Clock3 className="h-4 w-4" />
              Best for today
            </div>
            <h3 className="mt-2 text-lg font-semibold text-foreground">A focused study loop</h3>
            <div className="mt-4 space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-[#059669]" />
                <span>Start with notes and a revision plan to organize your session.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-[#059669]" />
                <span>Use flashcards and quiz questions for active recall after each study block.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-[#059669]" />
                <span>Finish by checking weak topics and tailoring the next revision session.</span>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-2xl border border-[#7C3AED]/15 bg-[#7C3AED]/8 px-3 py-2 text-sm font-medium text-[#7C3AED]">
              <Trophy className="h-4 w-4" />
              Built to feel like an exam command center, not a scattered toolset.
            </div>
          </div>

          <div className="rounded-[24px] border border-border/60 bg-white p-5 shadow-sm dark:bg-card">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-[#2563EB]">
              <Upload className="h-4 w-4" />
              Learning materials
            </div>
            <h3 className="mt-2 text-lg font-semibold text-foreground">Document-based study support</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Use the notes generator to turn handouts, slides, or topic outlines into organized study materials you can review quickly.
            </p>
            <Link href="/tools/ai/ai-study-notes">
              <a className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#2563EB]">
                Launch notes workflow
                <ArrowRight className="h-4 w-4" />
              </a>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
