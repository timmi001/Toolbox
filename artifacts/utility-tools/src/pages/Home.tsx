import { useEffect, useMemo, useState } from 'react';
import { Link } from 'wouter';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  FileText,
  RefreshCw,
  Sparkles,
  Wand2,
} from 'lucide-react';
import { generateHubResponse } from '@/lib/hub-ai';
import { getDailyBrief, saveDailyBrief } from '@/utils/dailyBriefStorage';
import './Home.css';

const HUB_CARDS = [
  { title: 'Chat with PDF', href: '/hub/ai', description: 'Upload a PDF and get clear summaries, notes, and document analysis in one focused workspace.', icon: FileText, accent: '#5BE4B6', gradient: 'from-[#123E37] via-[#102D30] to-[#101A28]', glow: 'rgba(91,228,182,0.24)' },
  { title: 'Creator Hub', href: '/hub/creator', description: 'Turn rough ideas into polished content and creative direction.', icon: Wand2, accent: '#FF72C2', gradient: 'from-[#4C1F43] via-[#33203C] to-[#171A2B]', glow: 'rgba(255,114,194,0.24)' },
  { title: 'Study Hub', href: '/hub/study', description: 'Learn faster, practice more and build a better study routine.', icon: BookOpen, accent: '#6E9BFF', gradient: 'from-[#1C3569] via-[#17294E] to-[#131D31]', glow: 'rgba(110,155,255,0.24)' },
  { title: 'Career Hub', href: '/hub/career', description: 'Prepare for your next opportunity with practical AI guidance.', icon: BriefcaseBusiness, accent: '#B18AFF', gradient: 'from-[#39265E] via-[#292244] to-[#171A2C]', glow: 'rgba(177,138,255,0.24)' },
  { title: 'Business Hub', href: '/hub/business', description: 'Plan, organize and grow your business in one focused workspace.', icon: BarChart3, accent: '#F5C05A', gradient: 'from-[#55401D] via-[#3A2E20] to-[#1B1D2A]', glow: 'rgba(245,192,90,0.24)' },
] as const;

const TECH_BRIEF_ITEMS = [
  { title: 'OpenAI unveils a faster AI model', summary: 'The latest release focuses on lower latency, stronger reasoning, and broader productivity gains for teams building AI workflows.' },
  { title: 'AI agents are moving from demos to daily ops', summary: 'Product teams are using agentic workflows to automate routine tasks, accelerate research, and reduce repetitive decision cycles.' },
  { title: 'Operational clarity is becoming the edge', summary: 'The strongest teams are pairing fast AI tools with better planning, stronger prompts, and clearer weekly priorities.' },
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
  const [briefIndex, setBriefIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setBriefIndex((current) => (current + 1) % TECH_BRIEF_ITEMS.length);
    }, 10000);

    return () => window.clearInterval(timer);
  }, []);

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
    <div className="home-redesign w-full min-h-[100dvh] overflow-x-hidden">
      <div className="home-frame w-full">
        <div className="home-screen">
          <section className="home-intro">
            <div className="home-kicker"><span />Your workspace</div>
            <h1>{greeting}</h1>
            <p>What would you like to accomplish today?</p>

            <div className="home-tech-brief-scroll">
              <button type="button" onClick={() => { setBriefOpen(true); if (!brief) void generateBrief(); }} className="home-tech-brief-card">
                <div className="home-tech-brief-top">
                  <span className="home-tech-brief-label">TECH BRIEF</span>
                  <span className="home-tech-brief-time">{new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>
                </div>

                <div className="home-tech-brief-body">
                  <div className="home-tech-icon" aria-hidden="true">
                    <Sparkles className="h-3.5 w-3.5" />
                  </div>

                  <div className="home-tech-brief-copy-wrap">
                    <h3>{TECH_BRIEF_ITEMS[briefIndex].title}</h3>
                    <p>{brief || TECH_BRIEF_ITEMS[briefIndex].summary}</p>
                  </div>
                </div>

                <div className="home-tech-brief-action">
                  <span>Read more</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </button>
            </div>
          </section>

          <section className="home-hubs">
            <div className="home-section-label">Start here</div>
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