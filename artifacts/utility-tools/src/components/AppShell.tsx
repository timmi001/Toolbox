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
  Plus,
  Search,
  Settings2,
  Sparkles,
  Video,
  X,
  Zap,
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

function GlobalHeader({ onDesktopToggle, onMobileOpen, sidebarCollapsed }: { onDesktopToggle: () => void; onMobileOpen: () => void; sidebarCollapsed: boolean }) {
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
      </div>
    </header>
  );
}

export function AppShell({ children }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [location] = useLocation();
  useEffect(() => setMobileOpen(false), [location]);

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

      <div className={`flex min-h-screen flex-col transition-[margin] duration-200 ${collapsed ? 'lg:ml-[76px]' : 'lg:ml-[264px]'}`}>
        {!location.startsWith('/hub/') && <GlobalHeader onDesktopToggle={() => setCollapsed((value) => !value)} onMobileOpen={() => setMobileOpen(true)} sidebarCollapsed={collapsed} />}
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
