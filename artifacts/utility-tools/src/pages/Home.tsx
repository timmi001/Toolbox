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
import './Home.css';

const HUB_CARDS = [
  { title: 'AI Assistant', href: '/hub/ai', description: 'Chat, write, research and brainstorm in one focused workspace.', icon: Sparkles, accent: '#5BE4B6', gradient: 'from-[#123E37] via-[#102D30] to-[#101A28]', glow: 'rgba(91,228,182,0.24)' },
  { title: 'Creator Hub', href: '/hub/creator', description: 'Turn rough ideas into polished content and creative direction.', icon: Wand2, accent: '#FF72C2', gradient: 'from-[#4C1F43] via-[#33203C] to-[#171A2B]', glow: 'rgba(255,114,194,0.24)' },
  { title: 'Study Hub', href: '/hub/study', description: 'Learn faster, practice more and build a better study routine.', icon: BookOpen, accent: '#6E9BFF', gradient: 'from-[#1C3569] via-[#17294E] to-[#131D31]', glow: 'rgba(110,155,255,0.24)' },
  { title: 'Career Hub', href: '/hub/career', description: 'Prepare for your next opportunity with practical AI guidance.', icon: BriefcaseBusiness, accent: '#B18AFF', gradient: 'from-[#39265E] via-[#292244] to-[#171A2C]', glow: 'rgba(177,138,255,0.24)' },
  { title: 'Business Hub', href: '/hub/business', description: 'Plan, organize and grow your business in one focused workspace.', icon: BarChart3, accent: '#F5C05A', gradient: 'from-[#55401D] via-[#3A2E20] to-[#1B1D2A]', glow: 'rgba(245,192,90,0.24)' },
] as const;

type HubObjectVariant = 'spark' | 'ribbon' | 'flower' | 'cluster' | 'orb';

function HubObject({ variant }: { variant: HubObjectVariant }) {
  return (
    <div className={`home-object home-object-${variant}`} aria-hidden="true">
      <span className="home-object-piece home-object-piece-a" />
      <span className="home-object-piece home-object-piece-b" />
      <span className="home-object-piece home-object-piece-c" />
      <span className="home-object-piece home-object-piece-d" />
    </div>
  );
}

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
    <div className="home-redesign">
      <div className="home-frame">
        <div className="home-screen">
          <section className="home-intro">
            <div className="home-kicker"><span />Your workspace</div>
            <h1>{greeting}</h1>
            <p>What would you like to accomplish today?</p>
            <button type="button" onClick={() => { setBriefOpen(true); if (!brief) void generateBrief(); }} className="home-brief-button">
              <CalendarDays className="h-4 w-4" />Daily Brief<ArrowRight className="h-4 w-4" />
            </button>
          </section>

          {briefOpen && <section className="home-brief-panel">
            <div className="home-brief-heading">
              <div><div className="home-brief-label">Today</div><h2>Daily Brief</h2></div>
              <div className="home-brief-actions">
                <button type="button" onClick={() => void generateBrief()} disabled={briefLoading}><RefreshCw className={briefLoading ? 'animate-spin' : ''} />Refresh</button>
                <button type="button" onClick={() => setBriefOpen(false)}>Close</button>
              </div>
            </div>
            {briefLoading ? <p className="home-brief-copy home-brief-loading">Preparing your brief...</p> : briefError ? <div className="home-brief-copy home-brief-error"><span>{briefError}</span><button type="button" onClick={() => void generateBrief()}>Retry</button></div> : <p className="home-brief-copy">{brief || 'No brief generated yet.'}</p>}
          </section>}

          <section className="home-hubs">
            <div className="home-section-heading">
              <div className="home-section-label">Start here</div>
              <h2>Your core hubs</h2>
              <p>Focused spaces for creating, learning, planning, and getting work done.</p>
            </div>
            <div className="home-card-rail">
              {HUB_CARDS.map(({ title, href, description }, index) => (
                <Link key={title} href={href} className="home-card-link">
                  <article className={`home-hub-card home-hub-card-${index} group`}>
                    <h3>{title}</h3>
                    <HubObject variant={(['orb', 'spark', 'ribbon', 'flower', 'cluster'] as HubObjectVariant[])[index]} />
                    <p>{description}</p>
                    <span className="home-card-cta">Open Hub<ArrowRight className="transition-transform group-hover:translate-x-1" /></span>
                  </article>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}