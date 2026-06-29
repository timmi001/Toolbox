import { Link } from 'wouter';
import * as Icons from 'lucide-react';
import { Tool } from '@/lib/tools-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ToolCardProps {
  tool: Tool;
}

export function ToolCard({ tool }: ToolCardProps) {
  const IconComponent = (Icons as any)[tool.icon] || Icons.Wrench;

  return (
    <Link href={`/tools/${tool.category}/${tool.slug}`}>
      <Card className="h-full hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,168,107,0.15)] bg-card/40 backdrop-blur-sm group cursor-pointer overflow-hidden border-border/50">
        <CardHeader className="p-5 pb-3">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2.5 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
              <IconComponent className="w-5 h-5" />
            </div>
            {tool.new && <Badge variant="default" className="bg-primary hover:bg-primary text-primary-foreground text-[10px] px-2 py-0 h-5">NEW</Badge>}
            {tool.trending && !tool.new && <Badge variant="secondary" className="bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 text-[10px] px-2 py-0 h-5">TRENDING</Badge>}
          </div>
          <CardTitle className="text-lg font-semibold tracking-tight text-card-foreground group-hover:text-primary transition-colors">{tool.name}</CardTitle>
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
