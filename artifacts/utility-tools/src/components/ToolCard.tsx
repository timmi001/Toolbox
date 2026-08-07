import { Link } from 'wouter';
import * as Icons from 'lucide-react';
import { Tool, ToolCategory, getToolRoutePath } from '@/lib/tools-data';
import { Badge } from '@/components/ui/badge';

interface ToolCardProps {
  tool: Tool;
}

const categoryColors: Record<ToolCategory, { bubble: string; hover: string; title: string }> = {
  text:              { bubble: 'bg-blue-500/10 text-blue-500',      hover: 'group-hover:bg-blue-500 group-hover:text-white',      title: 'group-hover:text-blue-500' },
  developer:         { bubble: 'bg-violet-500/10 text-violet-500',  hover: 'group-hover:bg-violet-500 group-hover:text-white',    title: 'group-hover:text-violet-500' },
  image:             { bubble: 'bg-pink-500/10 text-pink-500',      hover: 'group-hover:bg-pink-500 group-hover:text-white',      title: 'group-hover:text-pink-500' },
  pdf:               { bubble: 'bg-red-500/10 text-red-500',        hover: 'group-hover:bg-red-500 group-hover:text-white',       title: 'group-hover:text-red-500' },
  calculators:       { bubble: 'bg-amber-500/10 text-amber-500',    hover: 'group-hover:bg-amber-500 group-hover:text-white',     title: 'group-hover:text-amber-500' },
  'file-conversion': { bubble: 'bg-indigo-500/10 text-indigo-500',  hover: 'group-hover:bg-indigo-500 group-hover:text-white',    title: 'group-hover:text-indigo-500' },
  business:          { bubble: 'bg-emerald-500/10 text-emerald-500',hover: 'group-hover:bg-emerald-500 group-hover:text-white',   title: 'group-hover:text-emerald-500' },
  ai:                { bubble: 'bg-purple-500/10 text-purple-500',  hover: 'group-hover:bg-purple-500 group-hover:text-white',    title: 'group-hover:text-purple-500' },
  marketing:         { bubble: 'bg-fuchsia-500/10 text-fuchsia-500',hover: 'group-hover:bg-fuchsia-500 group-hover:text-white',   title: 'group-hover:text-fuchsia-500' },
  audio:             { bubble: 'bg-orange-500/10 text-orange-500',  hover: 'group-hover:bg-orange-500 group-hover:text-white',    title: 'group-hover:text-orange-500' },
  video:             { bubble: 'bg-cyan-500/10 text-cyan-500',      hover: 'group-hover:bg-cyan-500 group-hover:text-white',      title: 'group-hover:text-cyan-500' },
  'ai-resume':       { bubble: 'bg-sky-500/10 text-sky-500',        hover: 'group-hover:bg-sky-500 group-hover:text-white',       title: 'group-hover:text-sky-500' },
  'ai-social':       { bubble: 'bg-rose-500/10 text-rose-500',      hover: 'group-hover:bg-rose-500 group-hover:text-white',      title: 'group-hover:text-rose-500' },
  'ai-blogging-seo': { bubble: 'bg-lime-500/10 text-lime-500',      hover: 'group-hover:bg-lime-500 group-hover:text-white',      title: 'group-hover:text-lime-500' },
  'ai-email':        { bubble: 'bg-yellow-500/10 text-yellow-600',  hover: 'group-hover:bg-yellow-500 group-hover:text-white',    title: 'group-hover:text-yellow-600' },
  'ai-grammar':      { bubble: 'bg-slate-500/10 text-slate-500',    hover: 'group-hover:bg-slate-500 group-hover:text-white',     title: 'group-hover:text-slate-500' },
  'ai-ghostwriting': { bubble: 'bg-indigo-500/10 text-indigo-600',  hover: 'group-hover:bg-indigo-500 group-hover:text-white',    title: 'group-hover:text-indigo-600' },
  'ai-events':       { bubble: 'bg-orange-500/10 text-orange-600',  hover: 'group-hover:bg-orange-500 group-hover:text-white',    title: 'group-hover:text-orange-600' },
  'ai-study':        { bubble: 'bg-blue-500/10 text-blue-600',     hover: 'group-hover:bg-blue-500 group-hover:text-white',     title: 'group-hover:text-blue-600' },
};

export function ToolCard({ tool }: ToolCardProps) {
  const IconComponent = (Icons as any)[tool.icon] || Icons.Wrench;
  const colors = categoryColors[tool.category] ?? categoryColors.text;

  return (
    <Link href={getToolRoutePath(tool)}>
      <div className="group flex h-full cursor-pointer flex-col gap-2 rounded-xl border border-border/50 bg-card/40 p-3 backdrop-blur-sm transition-all duration-200 hover:border-primary/40 hover:shadow-md hover:shadow-primary/5">
        {/* Icon + badge */}
        <div className="flex items-start justify-between">
          <div className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors duration-200 ${colors.bubble} ${colors.hover}`}>
            <IconComponent className="h-3.5 w-3.5" />
          </div>
          {tool.new && (
            <Badge variant="default" className="h-4 bg-primary px-1.5 py-0 text-[9px] text-primary-foreground">NEW</Badge>
          )}
          {tool.trending && !tool.new && (
            <Badge variant="secondary" className="h-4 bg-orange-500/10 px-1.5 py-0 text-[9px] text-orange-500">HOT</Badge>
          )}
        </div>
        {/* Title */}
        <p className={`text-sm font-semibold leading-tight text-card-foreground transition-colors ${colors.title}`}>
          {tool.name}
        </p>
        {/* Description */}
        <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {tool.description}
        </p>
      </div>
    </Link>
  );
}
