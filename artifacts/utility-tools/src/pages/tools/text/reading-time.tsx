import { useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export default function ReadingTime() {
  const tool = getToolBySlug('reading-time')!;
  const [text, setText] = useState('');

  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const speeds = [
    { label: 'Slow (150 WPM)', wpm: 150 },
    { label: 'Average (200 WPM)', wpm: 200 },
    { label: 'Fast (250 WPM)', wpm: 250 },
    { label: 'Speed Read (300 WPM)', wpm: 300 },
  ];

  function formatTime(minutes: number) {
    if (minutes < 1) return 'Less than 1 minute';
    const mins = Math.ceil(minutes);
    if (mins < 60) return `${mins} minute${mins > 1 ? 's' : ''}`;
    const hrs = Math.floor(mins / 60);
    const rem = mins % 60;
    return `${hrs}h ${rem > 0 ? `${rem}m` : ''}`.trim();
  }

  return (
    <ToolLayout tool={tool} instructions="Paste your text below to see estimated reading times at different speeds.">
      <Textarea
        placeholder="Paste your text here..."
        className="min-h-[200px] mb-6 resize-y"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="grid grid-cols-2 gap-4 mb-4">
        {speeds.map(({ label, wpm }) => (
          <div key={wpm} className="bg-muted/30 border border-border/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-primary mb-1">{formatTime(words / wpm)}</div>
            <div className="text-sm text-muted-foreground">{label}</div>
          </div>
        ))}
      </div>
      <div className="text-center text-muted-foreground text-sm">
        Word count: <span className="text-foreground font-medium">{words.toLocaleString()}</span>
      </div>
      <Button variant="outline" className="mt-4 w-full" onClick={() => setText('')}>Reset</Button>
    </ToolLayout>
  );
}
