import { Sparkles, Search } from 'lucide-react';

export function EmptyHistory() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center">
      <div className="rounded-full bg-primary/10 p-4 text-primary">
        <Sparkles className="h-8 w-8" />
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">No AI history yet</h3>
        <p className="text-sm text-muted-foreground max-w-md">
          Start using any AI tool and your generations will appear here automatically.
        </p>
      </div>
      <div className="flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-xs text-muted-foreground">
        <Search className="h-3.5 w-3.5" />
        Local-only history, stored on this device.
      </div>
    </div>
  );
}
