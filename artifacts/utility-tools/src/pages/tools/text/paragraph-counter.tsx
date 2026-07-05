import { useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Textarea } from '@/components/ui/textarea';

export default function ParagraphCounter() {
  const tool = getToolBySlug('paragraph-counter')!;
  const [text, setText] = useState('');

  const paragraphs = text.trim() ? text.split(/\n+/).filter(p => p.trim() !== '') : [];
  const paragraphCount = paragraphs.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const avgWords = paragraphCount > 0 ? Math.round(wordCount / paragraphCount) : 0;

  return (
    <ToolLayout tool={tool} instructions="Type or paste your text to count paragraphs.">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-muted/30 border border-border/50 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-foreground mb-1">{paragraphCount}</div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider">Paragraphs</div>
        </div>
        <div className="bg-muted/30 border border-border/50 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-foreground mb-1">{avgWords}</div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider">Avg Words / Paragraph</div>
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
