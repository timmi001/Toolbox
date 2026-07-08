import { Link } from 'wouter';
import * as Icons from 'lucide-react';
import { Tool, ToolCategory, getToolRoutePath } from '@/lib/tools-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ToolCardProps {
  tool: Tool;
}

const categoryColors: Record<ToolCategory, { bubble: string; hover: string; title: string }> = {
  text:            { bubble: 'bg-blue-500/10 text-blue-500',    hover: 'group-hover:bg-blue-500 group-hover:text-white',    title: 'group-hover:text-blue-500' },
  developer:       { bubble: 'bg-violet-500/10 text-violet-500', hover: 'group-hover:bg-violet-500 group-hover:text-white',  title: 'group-hover:text-violet-500' },
  image:           { bubble: 'bg-pink-500/10 text-pink-500',     hover: 'group-hover:bg-pink-500 group-hover:text-white',    title: 'group-hover:text-pink-500' },
  pdf:             { bubble: 'bg-red-500/10 text-red-500',       hover: 'group-hover:bg-red-500 group-hover:text-white',     title: 'group-hover:text-red-500' },
  calculators:     { bubble: 'bg-amber-500/10 text-amber-500',   hover: 'group-hover:bg-amber-500 group-hover:text-white',   title: 'group-hover:text-amber-500' },
  seo:             { bubble: 'bg-teal-500/10 text-teal-500',     hover: 'group-hover:bg-teal-500 group-hover:text-white',    title: 'group-hover:text-teal-500' },
  'file-conversion': { bubble: 'bg-indigo-500/10 text-indigo-500', hover: 'group-hover:bg-indigo-500 group-hover:text-white', title: 'group-hover:text-indigo-500' },
  business:        { bubble: 'bg-emerald-500/10 text-emerald-500', hover: 'group-hover:bg-emerald-500 group-hover:text-white', title: 'group-hover:text-emerald-500' },
  ai:              { bubble: 'bg-purple-500/10 text-purple-500',  hover: 'group-hover:bg-purple-500 group-hover:text-white',  title: 'group-hover:text-purple-500' },
  marketing:       { bubble: 'bg-fuchsia-500/10 text-fuchsia-500', hover: 'group-hover:bg-fuchsia-500 group-hover:text-white', title: 'group-hover:text-fuchsia-500' },
  audio:           { bubble: 'bg-orange-500/10 text-orange-500', hover: 'group-hover:bg-orange-500 group-hover:text-white',  title: 'group-hover:text-orange-500' },
  video:           { bubble: 'bg-cyan-500/10 text-cyan-500',     hover: 'group-hover:bg-cyan-500 group-hover:text-white',    title: 'group-hover:text-cyan-500' },
};

export function ToolCard({ tool }: ToolCardProps) {
  const IconComponent = (Icons as any)[tool.icon] || Icons.Wrench;
  const colors = categoryColors[tool.category] ?? categoryColors.text;

  return (
    <Link href={getToolRoutePath(tool)}>
      <Card className="h-full hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,168,107,0.15)] bg-card/40 backdrop-blur-sm group cursor-pointer overflow-hidden border-border/50">
        <CardHeader className="p-5 pb-3">
          <div className="flex justify-between items-start mb-2">
            <div className={`p-2.5 rounded-lg transition-colors duration-300 ${colors.bubble} ${colors.hover}`}>
              <IconComponent className="w-5 h-5" />
            </div>
            {tool.new && <Badge variant="default" className="bg-primary hover:bg-primary text-primary-foreground text-[10px] px-2 py-0 h-5">NEW</Badge>}
            {tool.trending && !tool.new && <Badge variant="secondary" className="bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 text-[10px] px-2 py-0 h-5">TRENDING</Badge>}
          </div>
          <CardTitle className={`text-lg font-semibold tracking-tight text-card-foreground transition-colors ${colors.title}`}>{tool.name}</CardTitle>
        </CardHeader>
        <CardContent className="p-5 pt-0">
          <CardDescription className="text-sm line-clamp-2 text-muted-foreground">
            {tool.description}
          </CardDescription>
        </CardContent>
      </Card>
    </Link>
  );
}
