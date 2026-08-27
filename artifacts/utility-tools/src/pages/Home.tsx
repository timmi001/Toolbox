import { useMemo, useState } from 'react';
import { Link } from 'wouter';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  RefreshCw,
  Sparkles,
  Wand2,
} from 'lucide-react';
import { generateHubResponse } from '@/lib/hub-ai';
import { getDailyBrief, saveDailyBrief } from '@/utils/dailyBriefStorage';

const HUB_CARDS = [
  { title: 'AI Assistant', href: '/hub/ai', description: 'Chat, write, research and brainstorm in one focused workspace.', icon: Sparkles, accent: '#5BE4B6', gradient: 'from-[#123E37] via-[#102D30] to-[#101A28]', glow: 'rgba(91,228,182,0.24)' },
  { title: 'Creator Hub', href: '/hub/creator', description: 'Turn rough ideas into polished content and creative direction.', icon: Wand2, accent: '#FF72C2', gradient: 'from-[#4C1F43] via-[#33203C] to-[#171A2B]', glow: 'rgba(255,114,194,0.24)' },
  { title: 'Study Hub', href: '/hub/study', description: 'Learn faster, practice more and build a better study routine.', icon: BookOpen, accent: '#6E9BFF', gradient: 'from-[#1C3569] via-[#17294E] to-[#131D31]', glow: 'rgba(110,155,255,0.24)' },
  { title: 'Career Hub', href: '/hub/career', description: 'Prepare for your next opportunity with practical AI guidance.', icon: BriefcaseBusiness, accent: '#B18AFF', gradient: 'from-[#39265E] via-[#292244] to-[#171A2C]', glow: 'rgba(177,138,255,0.24)' },
  { title: 'Business Hub', href: '/hub/business', description: 'Plan, organize and grow your business in one focused workspace.', icon: BarChart3, accent: '#F5C05A', gradient: 'from-[#55401D] via-[#3A2E20] to-[#1B1D2A]', glow: 'rgba(245,192,90,0.24)' },
] as const;

function getGreeting(hour: number) {
  if (hour < 12) return 'Good morning,';
  if (hour < 18) return 'Good afternoon,';
  return 'Good evening,';
}

export default function Home() {
  const greeting = useMemo(() => getGreeting(new Date().getHours()), []);
  const [briefOpen, setBriefOpen] = useState(false);
  const [brief, setBrief] = useState(() => getDailyBrief()?.content ?? '');
  const [briefLoading, setBriefLoading] = useState(false);
  const [briefError, setBriefError] = useState('');

  const generateBrief = async () => {
    setBriefLoading(true);
    setBriefError('');
    try {
      const result = await generateHubResponse('ai-assistant', {
        prompt: `Create a concise daily brief for ${new Date().toLocaleDateString()}. Give three practical priorities for today, one focus suggestion, and one encouraging closing note. Use the user's general workspace context and do not invent personal facts.`,
        mode: 'Daily Brief',
      });
      setBrief(saveDailyBrief(result).content);
    } catch (error) {
      setBriefError(error instanceof Error ? error.message : 'Unable to generate the daily brief.');
    } finally {
      setBriefLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-9">
      <section className="mb-5 flex flex-col gap-4 rounded-2xl border border-[#1D2B39] bg-[#0D151E] px-4 py-4 shadow-[0_18px_55px_rgba(0,0,0,0.2)] sm:mb-7 sm:gap-5 sm:rounded-[26px] sm:px-5 sm:py-6 lg:flex-row lg:items-center lg:justify-between lg:px-7">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#6C7B8C]"><span className="h-1.5 w-1.5 rounded-full bg-[#5BE4B6] shadow-[0_0_10px_#5BE4B6]" />Your workspace</div>
          <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl lg:text-4xl">{greeting}</h1>
          <p className="mt-2 text-sm text-[#91A0B0] sm:text-base">What would you like to accomplish today?</p>
        </div>
        <button type="button" onClick={() => { setBriefOpen(true); if (!brief) void generateBrief(); }} className="inline-flex h-10 w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-[#315046] bg-[#142C2B] px-4 text-sm font-semibold text-[#A9F2D8] transition hover:border-[#5BE4B6]/70 hover:bg-[#193A35] sm:h-11 sm:w-auto"><CalendarDays className="h-4 w-4" />Daily Brief<ArrowRight className="h-4 w-4" /></button>
      </section>

      {briefOpen && <section className="mb-7 rounded-[22px] border border-[#315046] bg-[#10211F] p-5 shadow-[0_18px_55px_rgba(0,0,0,0.18)]"><div className="flex items-start justify-between gap-4"><div><div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#78EAC7]">Today</div><h2 className="mt-1 text-xl font-bold text-white">Daily Brief</h2></div><div className="flex items-center gap-2"><button type="button" onClick={() => void generateBrief()} disabled={briefLoading} className="inline-flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold text-[#A9F2D8] hover:bg-[#183B34] disabled:opacity-60"><RefreshCw className={`h-3.5 w-3.5 ${briefLoading ? 'animate-spin' : ''}`} />Refresh</button><button type="button" onClick={() => setBriefOpen(false)} className="rounded-lg px-2.5 py-2 text-xs text-[#8492A3] hover:bg-[#183B34] hover:text-white">Close</button></div></div>{briefLoading ? <p className="mt-4 animate-pulse text-sm text-[#A9F2D8]">Preparing your brief...</p> : briefError ? <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-red-200"><span>{briefError}</span><button type="button" onClick={() => void generateBrief()} className="font-semibold text-white underline">Retry</button></div> : <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[#C5D0DB]">{brief || 'No brief generated yet.'}</p>}</section>}

      <section className="mt-4 sm:mt-0">
        <div className="mb-4"><div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#637387]">Start here</div><h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">Your core hubs</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-[#8492A3]">Focused spaces for creating, learning, planning, and getting work done.</p></div>
        <div className="hub-card-rail flex snap-x gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-2 md:overflow-visible md:pb-0 xl:grid-cols-5">
          {HUB_CARDS.map(({ title, href, description, icon: Icon, accent, gradient, glow }) => (
            <Link key={title} href={href} className="group min-w-[clamp(110px,32vw,150px)] snap-start md:min-w-0">
              <article className={`relative flex h-full min-h-[176px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${gradient} p-4 transition duration-200 hover:-translate-y-1 hover:border-white/20 sm:min-h-[228px] sm:rounded-[24px] sm:p-5`} style={{ boxShadow: `0 18px 38px ${glow}` }}>
                <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full blur-3xl" style={{ backgroundColor: accent, opacity: 0.16 }} />
                <div className="relative flex flex-1 flex-col"><div className="flex items-start justify-between gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-[#071017]/70 sm:h-11 sm:w-11 sm:rounded-2xl" style={{ boxShadow: `0 0 24px ${glow}` }}><Icon className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: accent }} /></div><span className="h-2 w-2 rounded-full sm:h-2.5 sm:w-2.5" style={{ backgroundColor: accent, boxShadow: `0 0 12px ${accent}` }} /></div><h3 className="mt-4 text-base font-bold text-white sm:mt-7 sm:text-lg">{title}</h3><p className="mt-1 line-clamp-3 text-xs leading-5 text-[#B3BFCC] sm:mt-2 sm:text-sm sm:leading-6">{description}</p><span className="mt-auto inline-flex items-center gap-2 pt-4 text-[11px] font-bold text-white sm:pt-6 sm:text-xs">Open Hub<ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform group-hover:translate-x-1" style={{ color: accent }} /></span></div>
              </article>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}