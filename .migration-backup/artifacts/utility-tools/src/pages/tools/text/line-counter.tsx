import { useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Textarea } from '@/components/ui/textarea';

export default function LineCounter() {
  const tool = getToolBySlug('line-counter')!;
  const [text, setText] = useState('');

  const lines = text ? text.split('\n') : [];
  const totalLines = lines.length;
  const blankLines = lines.filter(l => l.trim() === '').length;
  const nonBlankLines = totalLines - blankLines;

  return (
    <ToolLayout tool={tool} instructions="Type or paste your text to count lines.">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-muted/30 border border-border/50 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-foreground mb-1">{totalLines}</div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider">Total Lines</div>
        </div>
        <div className="bg-muted/30 border border-border/50 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-foreground mb-1">{blankLines}</div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider">Blank Lines</div>
        </div>
        <div className="bg-muted/30 border border-border/50 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-foreground mb-1">{nonBlankLines}</div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider">Non-Blank Lines</div>
        </div>
      </div>
      <Textarea
        placeholder="Type or paste your text here..."
        className="min-h-[300px] resize-y text-base p-4"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
    </ToolLayout>
  );
}
