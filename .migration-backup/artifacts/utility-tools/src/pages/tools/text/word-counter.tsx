import { useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Textarea } from '@/components/ui/textarea';

export default function WordCounter() {
  const tool = getToolBySlug('word-counter')!;
  const [text, setText] = useState('');

  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const chars = text.length;
  const charsNoSpaces = text.replace(/\s/g, '').length;
  const paragraphs = text.trim() ? text.split(/\n+/).filter(p => p.trim() !== '').length : 0;
  const sentences = text.trim() ? text.split(/[.!?]+/).filter(s => s.trim() !== '').length : 0;
  
  // Avg reading speed is 225 wpm
  const readingTimeMinutes = words / 225;
  const readingTimeDisplay = readingTimeMinutes < 1 && words > 0 
    ? 'Less than a minute' 
    : words === 0 ? '0 mins' : `${Math.ceil(readingTimeMinutes)} min(s)`;

  const stats = [
    { label: 'Words', value: words },
    { label: 'Characters', value: chars },
    { label: 'Characters (no spaces)', value: charsNoSpaces },
    { label: 'Sentences', value: sentences },
    { label: 'Paragraphs', value: paragraphs },
    { label: 'Reading Time', value: readingTimeDisplay },
  ];

  return (
    <ToolLayout tool={tool} instructions="Type or paste your text in the box below to see real-time statistics.">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {stats.map(stat => (
          <div key={stat.label} className="bg-muted/30 border border-border/50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</div>
          </div>
        ))}
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
