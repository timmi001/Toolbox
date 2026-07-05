import { useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Textarea } from '@/components/ui/textarea';

export default function CharacterCounter() {
  const tool = getToolBySlug('character-counter')!;
  const [text, setText] = useState('');

  const chars = text.length;
  const charsNoSpaces = text.replace(/\s/g, '').length;

  return (
    <ToolLayout tool={tool} instructions="Type or paste your text to count characters.">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-muted/30 border border-border/50 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-foreground mb-1">{chars}</div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider">Characters</div>
        </div>
        <div className="bg-muted/30 border border-border/50 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-foreground mb-1">{charsNoSpaces}</div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider">Without Spaces</div>
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
