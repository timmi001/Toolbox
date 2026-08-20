import { useEffect, useState } from 'react';
import { Link, useLocation, useRoute } from 'wouter';
import {
  Archive,
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  Calculator,
  Clock3,
  Code2,
  FileArchive,
  FileText,
  FolderOpen,
  Grid2X2,
  Heart,
  History,
  Image,
  LayoutDashboard,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Plus,
  Search,
  Settings2,
  Sparkles,
  Quote,
  Star,
  Video,
  X,
  Zap,
  Activity,
  Check,
  Flame,
} from 'lucide-react';

interface AppShellProps {
  children: React.ReactNode;
}

type NavItem = {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  badge?: string;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const workspaceItems: NavItem[] = [
  { label: 'Home', href: '/', icon: LayoutDashboard },
  { label: 'Favorites', href: '/favorites', icon: Heart },
  { label: 'Recent Tools', href: '/history', icon: Clock3 },
  { label: 'Saved Projects', href: '/projects', icon: FolderOpen },
  { label: 'History', href: '/history', icon: History },
];

const dailyHubItems: NavItem[] = [
  { label: 'AI Assistant', href: '/hub/ai', icon: Sparkles },
  { label: 'Creator Hub', href: '/hub/creator', icon: Zap },
  { label: 'Study Hub', href: '/hub/study', icon: BookOpen },
  { label: 'Career Hub', href: '/hub/career', icon: BriefcaseBusiness },
  { label: 'Business Hub', href: '/hub/business', icon: BarChart3 },
];

const utilityHubItems: NavItem[] = [
  { label: 'PDF & Documents', href: '/pdf-tools', icon: FileText },
  { label: 'Image Hub', href: '/image-tools', icon: Image },
  { label: 'Video Hub', href: '/video-tools', icon: Video },
  { label: 'Audio Hub', href: '/audio-tools', icon: FileArchive },
  { label: 'Developer Hub', href: '/developer-tools', icon: Code2 },
  { label: 'Calculator & Converter', href: '/calculators', icon: Calculator },
];

const discoverItems: NavItem[] = [
  { label: 'All Tools', href: '/', icon: Grid2X2, badge: '200+' },
  { label: 'Popular Tools', href: '/', icon: Zap },
  { label: 'New Tools', href: '/', icon: Plus },
  { label: 'Categories', href: '/', icon: Archive },
];

const navGroups: NavGroup[] = [
  { label: 'MY WORKSPACE', items: workspaceItems },
  { label: 'HUBS', items: dailyHubItems },
  { label: 'UTILITY', items: utilityHubItems },
  { label: 'DISCOVER', items: discoverItems },
];

function isItemActive(location: string, href: string) {
  const path = href.split('?')[0];
  if (path === '/') return location === '/';
  return location === path || location.startsWith(`${path}/`);
}

function ShellNavItem({ item, collapsed, onNavigate }: { item: NavItem; collapsed: boolean; onNavigate: () => void }) {
  const [location] = useLocation();
  const active = isItemActive(location, item.href);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      title={collapsed ? item.label : undefined}
      className={`group flex min-h-10 items-center gap-3 rounded-xl px-3 text-[13px] font-medium transition-colors ${
        collapsed ? 'justify-center px-0' : ''
      } ${
        active
          ? 'bg-[#183044] text-white shadow-[inset_2px_0_0_#35D5B0]'
          : 'text-[#8B98A8] hover:bg-[#111F2B] hover:text-white'
      }`}
    >
      <Icon className={`h-[17px] w-[17px] shrink-0 ${active ? 'text-[#57E4BD]' : 'text-[#758396] group-hover:text-[#B9C5D3]'}`} />
      {!collapsed && <span className="min-w-0 flex-1 truncate">{item.label}</span>}
      {!collapsed && item.badge && <span className="rounded-md bg-[#162737] px-1.5 py-0.5 text-[10px] text-[#8FA2B5]">{item.badge}</span>}
    </Link>
  );
}

function SidebarContent({ collapsed, onNavigate }: { collapsed: boolean; onNavigate: () => void }) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className={`flex h-[76px] shrink-0 items-center border-b border-[#172331] ${collapsed ? 'justify-center px-2' : 'gap-3 px-5'}`}>
        <Link href="/" onClick={onNavigate} className="flex items-center gap-3" title={collapsed ? 'Toolbuxx' : undefined}>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#3AE4B3] to-[#2382FF] shadow-[0_8px_25px_rgba(44,205,174,0.22)]">
            <img src="/logo.png" alt="Toolbuxx logo" className="h-6 w-6 object-contain" />
          </span>
          {!collapsed && (
            <span className="min-w-0">
              <span className="block truncate text-[15px] font-bold tracking-tight text-white">Toolbuxx</span>
              <span className="block truncate text-[9px] leading-4 text-[#7C8999]">Your everyday AI utility workspace</span>
            </span>
          )}
        </Link>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-5 [scrollbar-width:thin] [scrollbar-color:#263746_transparent]">
        {navGroups.map((group, index) => (
          <div key={group.label} className={index === 0 ? '' : 'mt-6'}>
            {!collapsed && <div className="mb-2 px-3 text-[9px] font-bold tracking-[0.18em] text-[#526276]">{group.label}</div>}
            {group.label === 'HUBS' && !collapsed && <div className="mb-1 px-3 text-[10px] text-[#69798C]">Daily</div>}
            <div className="space-y-1">
              {group.items.map((item) => <ShellNavItem key={item.label} item={item} collapsed={collapsed} onNavigate={onNavigate} />)}
            </div>
            {group.label === 'HUBS' && !collapsed && <div className="mb-1 mt-4 px-3 text-[10px] text-[#69798C]">Utility</div>}
          </div>
        ))}
      </nav>

      <div className={`shrink-0 border-t border-[#172331] p-3 ${collapsed ? 'flex justify-center' : ''}`}>
        {!collapsed ? (
          <div className="relative overflow-hidden rounded-2xl border border-[#315A65] bg-gradient-to-br from-[#103B3B] via-[#12302F] to-[#1D213D] p-4">
            <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#42E2B2]/15 blur-2xl" />
            <div className="relative">
              <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#78EAC7]"><Zap className="h-3.5 w-3.5" /> Toolbuxx Pro</div>
              <p className="text-xs leading-5 text-[#C3D2D7]">Unlock higher limits and smarter workflows.</p>
              <button type="button" className="mt-3 inline-flex h-8 items-center justify-center rounded-lg bg-[#5BE4B6] px-3 text-xs font-bold text-[#071713] transition hover:bg-[#8AF2D1]">Upgrade Now</button>
            </div>
          </div>
        ) : (
          <button type="button" title="Upgrade to Pro" className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#5BE4B6] to-[#6A78FF] text-[#061410]"><Zap className="h-4 w-4" /></button>
        )}
      </div>
    </div>
  );
}

function RightSidebar({ onClose }: { onClose: () => void }) {
  return (
    <>
      <button type="button" className="fixed inset-0 z-40 bg-black/60 lg:bg-black/30" onClick={onClose} aria-label="Close workspace panel" />
      <aside className="fixed inset-y-0 right-0 z-50 flex w-[min(360px,calc(100vw-24px))] flex-col border-l border-[#172331] bg-[#0C121A] text-white shadow-2xl">
        <div className="flex h-[76px] shrink-0 items-center justify-between border-b border-[#172331] px-5">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#637387]">Workspace pulse</div>
            <h2 className="mt-1 text-base font-bold">Your activity</h2>
          </div>
          <button type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#263545] bg-[#111D29] text-[#A4B0BE] hover:text-white" aria-label="Close workspace panel">
            <PanelRightClose className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 [scrollbar-color:#263746_transparent] [scrollbar-width:thin]">
          <p className="text-sm leading-6 text-[#91A0B0]">Keep an eye on your momentum while you move between tools.</p>
          <div className="mt-5 space-y-3">
            <div className="rounded-2xl border border-[#1D2B39] bg-[#0D151E] p-4">
              <div className="flex items-center justify-between"><span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#637387]">Daily streak</span><Flame className="h-4 w-4 text-[#F5C05A]" /></div>
              <div className="mt-2 text-xl font-black">12 days</div>
              <div className="mt-3 grid grid-cols-7 gap-1.5">{['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => <div key={`${day}-${index}`} className="text-center"><div className="mb-1 text-[9px] text-[#718194]">{day}</div><div className={`mx-auto flex h-6 w-6 items-center justify-center rounded-full ${index < 5 ? 'bg-[#25483D] text-[#5BE4B6]' : 'bg-[#182532] text-[#657589]'}`}>{index < 5 ? <Check className="h-3 w-3" /> : <span className="h-1 w-1 rounded-full bg-current" />}</div></div>)}</div>
            </div>

            <div className="rounded-2xl border border-[#1D2B39] bg-[#0D151E] p-4">
              <div className="flex items-center justify-between"><span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#637387]">Today's progress</span><Activity className="h-4 w-4 text-[#5BE4B6]" /></div>
              <div className="mt-2 text-xl font-black">78% <span className="text-xs font-medium text-[#8391A1]">complete</span></div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#1B2935]"><div className="h-full w-[78%] rounded-full bg-gradient-to-r from-[#43D6AE] to-[#6C8CFF]" /></div>
              <div className="mt-2 text-xs text-[#91A0B0]">12 of 15 tasks completed</div>
            </div>

            <div className="rounded-2xl border border-[#40355D] bg-gradient-to-br from-[#292044] to-[#171728] p-4"><Quote className="h-4 w-4 text-[#B18AFF]" /><p className="mt-3 text-sm leading-6 text-[#D4CCEB]">The best way to predict the future is to create it.</p><p className="mt-2 text-xs text-[#9A8BBE]">- Peter Drucker</p></div>

            <div className="relative overflow-hidden rounded-2xl border border-[#315046] bg-gradient-to-br from-[#123D36] to-[#1C283A] p-4"><Star className="absolute right-4 top-4 h-4 w-4 fill-[#F5C05A] text-[#F5C05A]" /><div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#78EAC7]">Premium offer</div><p className="mt-3 text-sm font-semibold leading-6 text-white">Save 50% with yearly plan!</p><p className="mt-1 text-xs leading-5 text-[#B9D4D1]">Get full access to all premium features.</p><button type="button" className="mt-4 text-xs font-bold text-[#7EEAC9]">Explore Plans <span aria-hidden="true">-&gt;</span></button></div>

            <div className="rounded-2xl border border-[#1D2B39] bg-[#0D151E] p-4"><div className="mb-4"><div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#637387]">Why Toolbuxx</div><h3 className="mt-1 text-base font-bold text-white">Why users choose Toolbuxx</h3></div><div className="space-y-4">{[['100% Free', 'No hidden charges'], ['No Sign Up', 'Jump right in'], ['Fast & Reliable', 'Results in seconds'], ['Privacy Focused', 'Your data is safe'], ['Always Improving', 'New tools every week']].map(([title, description]) => <div key={title} className="flex items-start gap-3"><span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-[#5BE4B6]" /><div><div className="text-xs font-semibold text-white">{title}</div><div className="mt-1 text-[11px] text-[#8492A3]">{description}</div></div></div>)}</div></div>

            <div className="rounded-2xl border border-[#1D2B39] bg-[#0D151E] p-4"><div className="grid grid-cols-2 gap-y-5">{[['200+', 'Powerful Tools'], ['12', 'Hubs'], ['1M+', 'Happy Users'], ['99.9%', 'Uptime']].map(([value, label]) => <div key={label} className="text-center"><div className="text-xl font-black text-white">{value}</div><div className="mt-1 text-[9px] font-bold uppercase tracking-[0.14em] text-[#718194]">{label}</div></div>)}</div></div>
          </div>
        </div>

        <div className="shrink-0 border-t border-[#172331] bg-[#0A0E14] px-4 py-4">
          <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#637387]">Recent activity</div>
          <div className="space-y-2.5">{[['AI Writer', '2m ago'], ['PDF Compressor', '15m ago'], ['Study Hub', '1h ago']].map(([name, time]) => <Link key={name} href="/history" onClick={onClose} className="flex items-center justify-between gap-3 text-sm"><span className="flex min-w-0 items-center gap-2.5 text-[#C5D0DB]"><span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#5BE4B6]" /><span className="truncate">{name}</span></span><span className="shrink-0 text-[11px] text-[#718194]">{time}</span></Link>)}</div>
        </div>
      </aside>
    </>
  );
}

function GlobalHeader({ onDesktopToggle, onMobileOpen, onRightOpen, sidebarCollapsed }: { onDesktopToggle: () => void; onMobileOpen: () => void; onRightOpen: () => void; sidebarCollapsed: boolean }) {
  const [query, setQuery] = useState('');
  const [, navigate] = useLocation();

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    if (query.trim()) navigate('/');
  };

  return (
    <header className="sticky top-0 z-30 flex h-[76px] shrink-0 items-center gap-3 border-b border-[#172331] bg-[#0A0E14]/95 px-4 backdrop-blur-xl sm:px-6">
      <button type="button" onClick={onMobileOpen} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#22303E] bg-[#101823] text-[#9AA8B8] hover:text-white lg:hidden" aria-label="Open navigation menu">
        <Menu className="h-[18px] w-[18px]" />
      </button>
      <button type="button" onClick={onDesktopToggle} className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#22303E] bg-[#101823] text-[#9AA8B8] hover:text-white lg:flex" aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
        {sidebarCollapsed ? <PanelLeftOpen className="h-[18px] w-[18px]" /> : <PanelLeftClose className="h-[18px] w-[18px]" />}
      </button>

      <form onSubmit={submitSearch} className="relative min-w-0 max-w-2xl flex-1">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-[#6D7C8E]" />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search 200+ tools or type anything..." className="h-11 w-full rounded-xl border border-[#22303E] bg-[#101823] pl-11 pr-4 text-sm text-white outline-none placeholder:text-[#67788B] focus:border-[#3BDDB2]/60" />
      </form>

      <div className="ml-auto flex shrink-0 items-center gap-2">
        <button type="button" className="hidden h-10 w-10 items-center justify-center rounded-xl border border-[#22303E] bg-[#101823] text-[#9AA8B8] hover:text-white sm:flex" aria-label="Open settings"><Settings2 className="h-[17px] w-[17px]" /></button>
        <button type="button" onClick={onRightOpen} className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#22303E] bg-[#101823] text-[#9AA8B8] hover:text-white" aria-label="Open workspace activity panel"><PanelRightOpen className="h-[17px] w-[17px]" /></button>
      </div>
    </header>
  );
}

export function AppShell({ children }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [location] = useLocation();
  useEffect(() => setMobileOpen(false), [location]);
  useEffect(() => setRightOpen(false), [location]);

  return (
    <div className="min-h-screen bg-[#0A0C10] text-white selection:bg-[#3BDDB2]/20">
      <aside className={`fixed inset-y-0 left-0 z-50 hidden border-r border-[#172331] bg-[#0C121A] transition-[width] duration-200 lg:block ${collapsed ? 'w-[76px]' : 'w-[264px]'}`}>
        <SidebarContent collapsed={collapsed} onNavigate={() => setMobileOpen(false)} />
      </aside>

      {mobileOpen && (
        <>
          <button type="button" className="fixed inset-0 z-40 bg-black/70 lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Close navigation" />
          <aside className="fixed inset-y-0 left-0 z-50 w-[286px] border-r border-[#172331] bg-[#0C121A] shadow-2xl lg:hidden">
            <div className="absolute right-3 top-5 z-10">
              <button type="button" onClick={() => setMobileOpen(false)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#263545] bg-[#111D29] text-[#A4B0BE]" aria-label="Close navigation"><X className="h-4 w-4" /></button>
            </div>
            <SidebarContent collapsed={false} onNavigate={() => setMobileOpen(false)} />
          </aside>
        </>
      )}

      {rightOpen && <RightSidebar onClose={() => setRightOpen(false)} />}

      <div className={`flex min-h-screen flex-col transition-[margin] duration-200 ${collapsed ? 'lg:ml-[76px]' : 'lg:ml-[264px]'}`}>
        {!location.startsWith('/hub/') && <GlobalHeader onDesktopToggle={() => setCollapsed((value) => !value)} onMobileOpen={() => setMobileOpen(true)} onRightOpen={() => setRightOpen(true)} sidebarCollapsed={collapsed} />}
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
