import { Link } from 'wouter';
import * as Icons from 'lucide-react';
import { Tool, ToolCategory, getToolRoutePath } from '@/lib/tools-data';
import { Badge } from '@/components/ui/badge';

interface ToolCardProps {
  tool: Tool;
}

const categoryColors: Record<ToolCategory, { bubble: string; hover: string; title: string }> = {
  text:              { bubble: 'bg-blue-400/15 text-blue-300',      hover: 'group-hover:bg-blue-400 group-hover:text-white',      title: 'group-hover:text-blue-300' },
  developer:         { bubble: 'bg-violet-400/15 text-violet-300',  hover: 'group-hover:bg-violet-400 group-hover:text-white',    title: 'group-hover:text-violet-300' },
  image:             { bubble: 'bg-pink-400/15 text-pink-300',      hover: 'group-hover:bg-pink-400 group-hover:text-white',      title: 'group-hover:text-pink-300' },
  pdf:               { bubble: 'bg-red-400/15 text-red-300',        hover: 'group-hover:bg-red-400 group-hover:text-white',       title: 'group-hover:text-red-300' },
  calculators:       { bubble: 'bg-amber-400/15 text-amber-300',    hover: 'group-hover:bg-amber-400 group-hover:text-white',     title: 'group-hover:text-amber-300' },
  'file-conversion': { bubble: 'bg-indigo-400/15 text-indigo-300',  hover: 'group-hover:bg-indigo-400 group-hover:text-white',    title: 'group-hover:text-indigo-300' },
  business:          { bubble: 'bg-emerald-400/15 text-emerald-300',hover: 'group-hover:bg-emerald-400 group-hover:text-white',   title: 'group-hover:text-emerald-300' },
  ai:                { bubble: 'bg-purple-400/15 text-purple-300',  hover: 'group-hover:bg-purple-400 group-hover:text-white',    title: 'group-hover:text-purple-300' },
  marketing:         { bubble: 'bg-fuchsia-400/15 text-fuchsia-300',hover: 'group-hover:bg-fuchsia-400 group-hover:text-white',    title: 'group-hover:text-fuchsia-300' },
  audio:             { bubble: 'bg-orange-400/15 text-orange-300',  hover: 'group-hover:bg-orange-400 group-hover:text-white',    title: 'group-hover:text-orange-300' },
  video:             { bubble: 'bg-cyan-400/15 text-cyan-300',      hover: 'group-hover:bg-cyan-400 group-hover:text-white',      title: 'group-hover:text-cyan-300' },
  'ai-resume':       { bubble: 'bg-sky-400/15 text-sky-300',        hover: 'group-hover:bg-sky-400 group-hover:text-white',      title: 'group-hover:text-sky-300' },
  'ai-social':       { bubble: 'bg-rose-400/15 text-rose-300',      hover: 'group-hover:bg-rose-400 group-hover:text-white',      title: 'group-hover:text-rose-300' },
  'ai-blogging-seo': { bubble: 'bg-lime-400/15 text-lime-300',      hover: 'group-hover:bg-lime-400 group-hover:text-white',      title: 'group-hover:text-lime-300' },
  'ai-email':        { bubble: 'bg-yellow-400/15 text-yellow-300',  hover: 'group-hover:bg-yellow-400 group-hover:text-white',    title: 'group-hover:text-yellow-300' },
  'ai-grammar':      { bubble: 'bg-slate-300/15 text-slate-200',    hover: 'group-hover:bg-slate-300 group-hover:text-slate-950',  title: 'group-hover:text-slate-200' },
  'ai-ghostwriting': { bubble: 'bg-indigo-400/15 text-indigo-300', hover: 'group-hover:bg-indigo-400 group-hover:text-white',    title: 'group-hover:text-indigo-300' },
  'ai-events':       { bubble: 'bg-orange-400/15 text-orange-300',  hover: 'group-hover:bg-orange-400 group-hover:text-white',    title: 'group-hover:text-orange-300' },
  'ai-study':        { bubble: 'bg-blue-400/15 text-blue-300',      hover: 'group-hover:bg-blue-400 group-hover:text-white',      title: 'group-hover:text-blue-300' },
};

export function ToolCard({ tool }: ToolCardProps) {
  const IconComponent = (Icons as any)[tool.icon] || Icons.Wrench;
  const colors = categoryColors[tool.category] ?? categoryColors.text;

  return (
    <Link href={getToolRoutePath(tool)}>
      <div className="group flex h-full cursor-pointer flex-col gap-2 rounded-xl border border-border/80 bg-card/80 p-3 backdrop-blur-sm transition-all duration-200 hover:border-primary/60 hover:bg-card hover:shadow-md hover:shadow-primary/10">
        {/* Icon + badge */}
        <div className="flex items-start justify-between">
          <div className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors duration-200 ${colors.bubble} ${colors.hover}`}>
            <IconComponent className="h-3.5 w-3.5" />
          </div>
          {tool.new && (
            <Badge variant="default" className="h-4 bg-primary px-1.5 py-0 text-[9px] text-primary-foreground">NEW</Badge>
          )}
          {tool.trending && !tool.new && (
            <Badge variant="secondary" className="h-4 border border-orange-300/30 bg-orange-400/15 px-1.5 py-0 text-[9px] text-orange-300">HOT</Badge>
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
