import { useMemo, useState } from 'react';
import { Link } from 'wouter';
import {
  ArrowRight,
  Activity,
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  Calculator,
  Check,
  ChevronDown,
  Code2,
  Clock3,
  FileText,
  Flame,
  Gauge,
  LockKeyhole,
  Plus,
  Quote,
  RefreshCw,
  Sparkles,
  Star,
  Wand2,
  Zap,
} from 'lucide-react';
import { generateHubResponse } from '@/lib/hub-ai';
import { getDailyBrief, saveDailyBrief } from '@/utils/dailyBriefStorage';

const HUB_CARDS = [
  { title: 'AI Assistant', href: '/hub/ai', description: 'Chat, write, research and automate anything with AI.', icon: Sparkles, accent: '#5BE4B6', gradient: 'from-[#123E37] via-[#102D30] to-[#101A28]', glow: 'rgba(91,228,182,0.24)' },
  { title: 'Creator Hub', href: '/hub/creator', description: 'Generate content for social media, blogs, videos and more.', icon: Wand2, accent: '#FF72C2', gradient: 'from-[#4C1F43] via-[#33203C] to-[#171A2B]', glow: 'rgba(255,114,194,0.24)' },
  { title: 'Study Hub', href: '/hub/study', description: 'Learn faster, practice more and ace every exam.', icon: BookOpen, accent: '#6E9BFF', gradient: 'from-[#1C3569] via-[#17294E] to-[#131D31]', glow: 'rgba(110,155,255,0.24)' },
  { title: 'Career Hub', href: '/hub/career', description: 'Build your career, land your dream job and grow.', icon: BriefcaseBusiness, accent: '#B18AFF', gradient: 'from-[#39265E] via-[#292244] to-[#171A2C]', glow: 'rgba(177,138,255,0.24)' },
  { title: 'Business Hub', href: '/hub/business', description: 'Start, run and grow your business with smart tools.', icon: BarChart3, accent: '#F5C05A', gradient: 'from-[#55401D] via-[#3A2E20] to-[#1B1D2A]', glow: 'rgba(245,192,90,0.24)' },
] as const;

const QUICK_TOOLS = [
  { name: 'AI Chat', href: '/hub/ai', icon: Sparkles, accent: '#5BE4B6' },
  { name: 'PDF Compressor', href: '/tools/pdf/compress-pdf', icon: FileText, accent: '#FF7777' },
  { name: 'Image Resizer', href: '/tools/image/image-resizer', icon: FileText, accent: '#F78BCB' },
  { name: 'Video Downloader', href: '/video-tools', icon: FileText, accent: '#48D9FF' },
  { name: 'AI Writer', href: '/tools/ai/ai-writer', icon: Wand2, accent: '#B18AFF' },
  { name: 'Grammar Checker', href: '/tools/ai/ai-grammar-checker', icon: FileText, accent: '#6E9BFF' },
  { name: 'YouTube Thumbnail', href: '/image-tools', icon: FileText, accent: '#F5C05A' },
] as const;

const EXPLORE_HUBS = [
  { title: 'PDF & Documents Hub', count: '20+ tools', href: '/pdf-tools', accent: '#FF7777', icon: FileText, tools: [['PDF Compressor', '/tools/pdf/compress-pdf'], ['PDF Merger', '/tools/pdf/merge-pdf'], ['PDF Splitter', '/tools/pdf/split-pdf'], ['PDF to Word', '/pdf-tools'], ['JPG to PDF', '/tools/pdf/jpg-to-pdf'], ['PDF OCR', '/pdf-tools'], ['PDF Editor', '/pdf-tools']], more: '+13 more tools...' },
  { title: 'Image Hub', count: '25+ tools', href: '/image-tools', accent: '#F78BCB', icon: FileText, tools: [['Image Compressor', '/tools/image/image-compressor'], ['Image Resizer', '/tools/image/image-resizer'], ['Background Remover', '/tools/image/bg-remover'], ['Image Converter', '/image-tools'], ['Image Cropper', '/tools/image/crop-image'], ['PNG to JPG', '/tools/image/png-to-jpg'], ['JPG to PNG', '/tools/image/jpg-to-png']], more: '+18 more tools...' },
  { title: 'Video Hub', count: '20+ tools', href: '/video-tools', accent: '#48D9FF', icon: FileText, tools: [['Video Downloader', '/video-tools'], ['Video Compressor', '/tools/video/video-compressor'], ['Video Converter', '/tools/video/video-converter'], ['Video to MP3', '/video-tools'], ['Video to GIF', '/tools/video/gif-maker'], ['Video Trimmer', '/tools/video/video-trimmer'], ['Video Resizer', '/video-tools']], more: '+13 more tools...' },
  { title: 'Audio Hub', count: '15+ tools', href: '/audio-tools', accent: '#FA8080', icon: FileText, tools: [['Audio Converter', '/tools/audio/mp3-converter'], ['Audio Compressor', '/audio-tools'], ['Audio to Text', '/tools/audio/speech-to-text'], ['Text to Speech', '/tools/audio/text-to-speech'], ['Audio Cutter', '/tools/audio/audio-trimmer'], ['MP3 Converter', '/tools/audio/mp3-converter'], ['WAV Converter', '/tools/audio/mp3-converter']], more: '+8 more tools...' },
  { title: 'Developer Hub', count: '30+ tools', href: '/developer-tools', accent: '#32D5B2', icon: Code2, tools: [['JSON Formatter', '/tools/developer/json-formatter'], ['JSON Validator', '/tools/developer/json-validator'], ['Base64 Encoder', '/tools/developer/base64-encode'], ['Base64 Decoder', '/tools/developer/base64-decode'], ['URL Encoder', '/tools/text/url-encoder'], ['HTML Formatter', '/developer-tools'], ['CSS Formatter', '/developer-tools']], more: '+23 more tools...' },
  { title: 'Calculator & Converter Hub', count: '20+ tools', href: '/calculators', accent: '#B39BFF', icon: Calculator, tools: [['Calculator', '/calculators'], ['Percentage Calculator', '/tools/calculators/percentage-calculator'], ['Age Calculator', '/tools/calculators/age-calculator'], ['Currency Converter', '/tools/calculators/currency-converter'], ['Unit Converter', '/tools/calculators/unit-converter'], ['Time Converter', '/calculators'], ['Date Calculator', '/tools/calculators/date-difference']], more: '+13 more tools...' },
] as const;

function getGreeting(hour: number) {
  if (hour < 12) return 'Good morning,';
  if (hour < 18) return 'Good afternoon,';
  return 'Good evening,';
}

const ACTIVITY = [
  ['AI Writer', '2m ago'],
  ['PDF Compressor', '15m ago'],
  ['Study Hub', '1h ago'],
  ['Interview Practice', '3h ago'],
  ['Image Resizer', '5h ago'],
];

const VALUE_POINTS = [
  ['100% Free', 'No hidden charges', Zap],
  ['No Sign Up', 'Jump right in', Sparkles],
  ['Fast & Reliable', 'Results in seconds', Gauge],
  ['Privacy Focused', 'Your data is safe', LockKeyhole],
  ['Always Improving', 'New tools every week', Activity],
] as const;

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
        prompt: `Create a concise daily brief for ${new Date().toLocaleDateString()}. Give three practical priorities for today, one focus suggestion, and one encouraging closing note. Use the user's general utility workspace context and do not invent personal facts.`,
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
    <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-9">
      <section className="mb-7 flex flex-col gap-5 rounded-[26px] border border-[#1D2B39] bg-[#0D151E] px-5 py-6 shadow-[0_18px_55px_rgba(0,0,0,0.2)] sm:flex-row sm:items-center sm:justify-between sm:px-7">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#6C7B8C]"><span className="h-1.5 w-1.5 rounded-full bg-[#5BE4B6] shadow-[0_0_10px_#5BE4B6]" />Your workspace</div>
          <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">{greeting}</h1>
          <p className="mt-2 text-sm text-[#91A0B0] sm:text-base">What would you like to accomplish today?</p>
        </div>
        <button type="button" onClick={() => { setBriefOpen(true); if (!brief) void generateBrief(); }} className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-[#315046] bg-[#142C2B] px-4 text-sm font-semibold text-[#A9F2D8] transition hover:border-[#5BE4B6]/70 hover:bg-[#193A35]"><CalendarDays className="h-4 w-4" />Daily Brief<ArrowRight className="h-4 w-4" /></button>
      </section>

      {briefOpen && <section className="mb-7 rounded-[22px] border border-[#315046] bg-[#10211F] p-5 shadow-[0_18px_55px_rgba(0,0,0,0.18)]"><div className="flex items-start justify-between gap-4"><div><div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#78EAC7]">Today</div><h2 className="mt-1 text-xl font-bold text-white">Daily Brief</h2></div><div className="flex items-center gap-2"><button type="button" onClick={() => void generateBrief()} disabled={briefLoading} className="inline-flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold text-[#A9F2D8] hover:bg-[#183B34] disabled:opacity-60"><RefreshCw className={`h-3.5 w-3.5 ${briefLoading ? 'animate-spin' : ''}`} />Refresh</button><button type="button" onClick={() => setBriefOpen(false)} className="rounded-lg px-2.5 py-2 text-xs text-[#8492A3] hover:bg-[#183B34] hover:text-white">Close</button></div></div>{briefLoading ? <p className="mt-4 animate-pulse text-sm text-[#A9F2D8]">Preparing your brief...</p> : briefError ? <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-red-200"><span>{briefError}</span><button type="button" onClick={() => void generateBrief()} className="font-semibold text-white underline">Retry</button></div> : <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[#C5D0DB]">{brief || 'No brief generated yet.'}</p>}</section>}

      <section>
        <div className="mb-4 flex items-end justify-between gap-4"><div><div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#637387]">Start here</div><h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">Your core hubs</h2></div><Link href="/" className="hidden items-center gap-2 text-sm font-semibold text-[#7EEAC9] hover:text-white sm:inline-flex">View all tools<ArrowRight className="h-4 w-4" /></Link></div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {HUB_CARDS.map(({ title, href, description, icon: Icon, accent, gradient, glow }) => (
            <Link key={title} href={href} className="group min-w-0">
              <article className={`relative flex h-full min-h-[228px] flex-col overflow-hidden rounded-[24px] border border-white/10 bg-gradient-to-br ${gradient} p-5 transition duration-200 hover:-translate-y-1 hover:border-white/20`} style={{ boxShadow: `0 18px 38px ${glow}` }}>
                <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full blur-3xl" style={{ backgroundColor: accent, opacity: 0.16 }} />
                <div className="relative flex flex-1 flex-col"><div className="flex items-start justify-between gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-[#071017]/70" style={{ boxShadow: `0 0 24px ${glow}` }}><Icon className="h-5 w-5" style={{ color: accent }} /></div><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: accent, boxShadow: `0 0 12px ${accent}` }} /></div><h3 className="mt-7 text-lg font-bold text-white">{title}</h3><p className="mt-2 text-sm leading-6 text-[#B3BFCC]">{description}</p><span className="mt-auto inline-flex items-center gap-2 pt-6 text-xs font-bold text-white">Open Hub<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" style={{ color: accent }} /></span></div>
              </article>
            </Link>
          ))}
        </div>
        <Link href="/" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#7EEAC9] hover:text-white sm:hidden">View all tools<ArrowRight className="h-4 w-4" /></Link>
      </section>

      <section className="mt-9">
        <div className="mb-4 flex items-end justify-between gap-4"><div><div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#637387]">Quick access</div><h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">Your Tools</h2></div><Link href="/history" className="inline-flex items-center gap-2 text-sm font-semibold text-[#7EEAC9] hover:text-white">View all<ArrowRight className="h-4 w-4" /></Link></div>
        <div className="flex snap-x gap-3 overflow-x-auto pb-2 [scrollbar-width:thin] [scrollbar-color:#2A3A48_transparent]">
          {QUICK_TOOLS.map(({ name, href, icon: Icon, accent }) => <Link key={name} href={href} className="group min-w-[178px] snap-start rounded-2xl border border-[#1D2B39] bg-[#0D151E] p-4 transition hover:-translate-y-0.5 hover:border-white/20"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#111E29]" style={{ color: accent }}><Icon className="h-4 w-4" /></span><span className="text-sm font-semibold text-white">{name}</span></div><div className="mt-4 flex items-center gap-1 text-[11px] text-[#7F91A4] group-hover:text-[#BCEEDF]">Open tool<ArrowRight className="h-3.5 w-3.5" /></div></Link>)}
          <Link href="/" className="group flex min-w-[178px] snap-start items-center justify-center rounded-2xl border border-dashed border-[#315046] bg-[#10211F] p-4 transition hover:border-[#5BE4B6]/70"><div className="text-center"><span className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-[#183B34] text-[#5BE4B6]"><Plus className="h-4 w-4" /></span><span className="mt-3 block text-sm font-semibold text-[#A9F2D8]">Add Tool</span></div></Link>
        </div>
      </section>

      <div className="mt-10 grid gap-6 xl:grid-cols-1">
      <section>
        <div className="mb-5 flex items-end justify-between gap-4"><div><div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#637387]">Directory</div><h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">Explore All Hubs</h2><p className="mt-1 text-sm text-[#8492A3]">200+ tools organized into powerful hubs</p></div><Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-[#7EEAC9] hover:text-white">View all hubs<ArrowRight className="h-4 w-4" /></Link></div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {EXPLORE_HUBS.map(({ title, count, href, accent, icon: Icon, tools, more }) => <article key={title} className="rounded-[22px] border border-[#1D2B39] bg-[#0D151E] p-5"><div className="flex items-start justify-between gap-3"><Link href={href} className="flex items-center gap-3 group"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#111E29]" style={{ color: accent }}><Icon className="h-5 w-5" /></span><span><span className="block text-sm font-bold text-white group-hover:text-[#A9F2D8]">{title}</span><span className="mt-1 block text-[11px] text-[#758598]">{count}</span></span></Link><ArrowRight className="mt-1 h-4 w-4 text-[#607286]" /></div><div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-2">{tools.map(([name, toolHref]) => <Link key={name} href={toolHref} className="truncate text-xs text-[#9EACBB] hover:text-white">{name}</Link>)}</div><Link href={href} className="mt-5 block text-xs font-semibold" style={{ color: accent }}>{more}</Link></article>)}
        </div>
      </section>

      <aside className="hidden space-y-4">
        <section className="rounded-[22px] border border-[#1D2B39] bg-[#0D151E] p-5">
          <div className="flex items-center justify-between"><div><div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#637387]">Daily streak</div><div className="mt-2 text-xl font-black text-white"><span className="mr-1">🔥</span>12 days</div></div><Flame className="h-5 w-5 text-[#F5C05A]" /></div>
          <div className="mt-5 grid grid-cols-7 gap-1.5">{['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => <div key={`${day}-${index}`} className="text-center"><div className="mb-2 text-[10px] text-[#718194]">{day}</div><div className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full ${index < 5 ? 'bg-[#25483D] text-[#5BE4B6]' : 'bg-[#182532] text-[#657589]'}`}>{index < 5 ? <Check className="h-3.5 w-3.5" /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}</div></div>)}</div>
        </section>

        <section className="rounded-[22px] border border-[#1D2B39] bg-[#0D151E] p-5">
          <div className="flex items-center justify-between"><div><div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#637387]">Today's progress</div><div className="mt-2 text-xl font-black text-white">78% <span className="text-xs font-medium text-[#8391A1]">Tasks completed</span></div></div><button type="button" className="inline-flex items-center gap-1 text-[11px] text-[#9AA8B8]">This Week<ChevronDown className="h-3 w-3" /></button></div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#1B2935]"><div className="h-full w-[78%] rounded-full bg-gradient-to-r from-[#43D6AE] to-[#6C8CFF]" /></div>
          <div className="mt-5 flex h-16 items-end gap-1.5">{[28, 42, 35, 58, 49, 72, 78].map((height, index) => <div key={index} className="flex-1 rounded-t-sm bg-gradient-to-t from-[#315A68] to-[#5BE4B6] opacity-80" style={{ height: `${height}%` }} />)}</div>
          <div className="mt-3 flex items-center gap-2 text-xs text-[#91A0B0]"><Activity className="h-3.5 w-3.5 text-[#5BE4B6]" />12 of 15 tasks completed</div>
        </section>

        <section className="rounded-[22px] border border-[#1D2B39] bg-[#0D151E] p-5"><div className="mb-3 flex items-center justify-between"><div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#637387]">Recent activity</div><Link href="/history" className="text-xs font-semibold text-[#7EEAC9]">View all</Link></div><div className="space-y-3">{ACTIVITY.map(([name, time]) => <Link key={name} href="/history" className="flex items-center justify-between gap-3 text-sm"><span className="flex min-w-0 items-center gap-2.5 text-[#C5D0DB]"><span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#5BE4B6]" /> <span className="truncate">{name}</span></span><span className="shrink-0 text-[11px] text-[#718194]">{time}</span></Link>)}</div></section>

        <section className="rounded-[22px] border border-[#40355D] bg-gradient-to-br from-[#292044] to-[#171728] p-5"><Quote className="h-5 w-5 text-[#B18AFF]" /><p className="mt-3 text-sm leading-6 text-[#D4CCEB]">The best way to predict the future is to create it.</p><p className="mt-2 text-xs text-[#9A8BBE]">— Peter Drucker</p></section>
        <section className="relative overflow-hidden rounded-[22px] border border-[#315046] bg-gradient-to-br from-[#123D36] to-[#1C283A] p-5"><Star className="absolute right-4 top-4 h-5 w-5 fill-[#F5C05A] text-[#F5C05A]" /><div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#78EAC7]">Premium offer</div><p className="mt-3 max-w-[220px] text-sm font-semibold leading-6 text-white">Save 50% with yearly plan!</p><p className="mt-1 text-xs leading-5 text-[#B9D4D1]">Get full access to all premium features.</p><button type="button" className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-[#7EEAC9]">Explore Plans <ArrowRight className="h-3.5 w-3.5" /></button></section>
        <section className="rounded-[22px] border border-[#1D2B39] bg-[#0D151E] p-5"><div className="mb-4"><div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#637387]">Why Toolbuxx</div><h2 className="mt-1 text-lg font-bold text-white">Why 1M+ Users Choose Toolbuxx</h2></div><div className="space-y-4">{VALUE_POINTS.map(([title, description, Icon]) => <div key={title} className="flex items-start gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#142B2B] text-[#5BE4B6]"><Icon className="h-3.5 w-3.5" /></span><div><div className="text-xs font-semibold text-white">{title}</div><div className="mt-1 text-[11px] text-[#8492A3]">{description}</div></div></div>)}</div></section>
        <section className="rounded-[22px] border border-[#1D2B39] bg-[#0D151E] p-5"><div className="grid grid-cols-2 gap-y-5">{[['200+', 'Powerful Tools'], ['12', 'Hubs'], ['1M+', 'Happy Users'], ['99.9%', 'Uptime']].map(([value, label]) => <div key={label} className="text-center"><div className="text-xl font-black text-white">{value}</div><div className="mt-1 text-[9px] font-bold uppercase tracking-[0.14em] text-[#718194]">{label}</div></div>)}</div></section>
      </aside>
      </div>

    </div>
  );
}
