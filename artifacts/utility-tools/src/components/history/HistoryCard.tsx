import * as Icons from 'lucide-react';
import { Copy, Download, Heart, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getToolBySlug } from '@/lib/tools-data';
import type { HistoryEntry } from '@/types/history';

interface HistoryCardProps {
  entry: HistoryEntry;
  expanded: boolean;
  onToggleExpanded: () => void;
  onToggleFavorite: () => void;
  onDelete: () => void;
  onCopyPrompt: () => void;
  onCopyResponse: () => void;
  onDownload: () => void;
}

const categoryTone: Record<string, string> = {
  text: 'bg-blue-500/10 text-blue-600',
  developer: 'bg-violet-500/10 text-violet-600',
  image: 'bg-pink-500/10 text-pink-600',
  pdf: 'bg-red-500/10 text-red-600',
  calculators: 'bg-amber-500/10 text-amber-600',
  'file-conversion': 'bg-indigo-500/10 text-indigo-600',
  business: 'bg-emerald-500/10 text-emerald-600',
  ai: 'bg-purple-500/10 text-purple-600',
  marketing: 'bg-fuchsia-500/10 text-fuchsia-600',
  audio: 'bg-orange-500/10 text-orange-600',
  video: 'bg-cyan-500/10 text-cyan-600',
};

export function HistoryCard({ entry, expanded, onToggleExpanded, onToggleFavorite, onDelete, onCopyPrompt, onCopyResponse, onDownload }: HistoryCardProps) {
  const resolvedTool = getToolBySlug(entry.toolSlug);
  const IconComponent = (Icons as any)[resolvedTool?.icon || 'Wrench'] || Icons.Wrench;

  return (
    <article className="rounded-2xl border border-border/60 bg-card/70 p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-primary/10 p-2 text-primary">
            <IconComponent className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-semibold">{entry.toolName}</div>
            <div className="text-xs text-muted-foreground">{new Date(entry.createdAt).toLocaleString()}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {entry.favorite && <Badge className="rounded-full bg-amber-500/10 text-amber-600">Favorite</Badge>}
          <Badge className={`rounded-full ${categoryTone[entry.toolCategory] ?? 'bg-slate-500/10 text-slate-600'}`}>{entry.toolCategory}</Badge>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <div className="space-y-1">
          <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Prompt</div>
          <p className="line-clamp-2 text-sm text-foreground">{entry.prompt}</p>
        </div>
        <div className="space-y-1">
          <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Response</div>
          <p className="line-clamp-3 text-sm text-muted-foreground">{entry.response}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span>{entry.characterCount} chars</span>
        <span>•</span>
        <span>{entry.favorite ? 'Pinned' : 'Not pinned'}</span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={onToggleFavorite} className="gap-1.5">
          <Heart className={`h-3.5 w-3.5 ${entry.favorite ? 'fill-current text-amber-500' : ''}`} />
          {entry.favorite ? 'Unfavorite' : 'Favorite'}
        </Button>
        <Button variant="outline" size="sm" onClick={onCopyPrompt} className="gap-1.5">
          <Copy className="h-3.5 w-3.5" /> Prompt
        </Button>
        <Button variant="outline" size="sm" onClick={onCopyResponse} className="gap-1.5">
          <Copy className="h-3.5 w-3.5" /> Response
        </Button>
        <Button variant="outline" size="sm" onClick={onDownload} className="gap-1.5">
          <Download className="h-3.5 w-3.5" /> Download
        </Button>
        <Button variant="outline" size="sm" onClick={onDelete} className="gap-1.5 text-destructive">
          <Trash2 className="h-3.5 w-3.5" /> Delete
        </Button>
        <Button variant="ghost" size="sm" onClick={onToggleExpanded} className="gap-1.5 ml-auto">
          {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          {expanded ? 'Less' : 'More'}
        </Button>
      </div>

      {expanded && (
        <div className="mt-4 rounded-xl border border-border/60 bg-muted/20 p-3">
          <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Full response</div>
          <div className="max-h-80 overflow-auto whitespace-pre-wrap text-sm text-foreground">{entry.response}</div>
        </div>
      )}
    </article>
  );
}
