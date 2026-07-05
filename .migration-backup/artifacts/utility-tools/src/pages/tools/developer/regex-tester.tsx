import { useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export default function RegexTester() {
  const tool = getToolBySlug('regex-tester')!;
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState('g');
  const [text, setText] = useState('Hello World, hello world!');
  const [error, setError] = useState('');

  let matches: RegExpExecArray[] = [];
  let highlighted = text;

  if (pattern) {
    try {
      const re = new RegExp(pattern, flags);
      setError('');
      const m: RegExpExecArray[] = [];
      let match;
      const testRe = new RegExp(pattern, flags.includes('g') ? flags : flags + 'g');
      while ((match = testRe.exec(text)) !== null) {
        m.push(match);
        if (!flags.includes('g')) break;
      }
      matches = m;
      highlighted = text.replace(new RegExp(pattern, flags.includes('g') ? flags : flags + 'g'), (m) =>
        `<mark class="bg-primary/40 text-foreground rounded px-0.5">${m}</mark>`
      );
    } catch (e: unknown) {
      setError((e as Error).message);
    }
  }

  return (
    <ToolLayout tool={tool} instructions="Enter a regex pattern and test it against text. Matches are highlighted.">
      <div className="flex gap-2 mb-4">
        <div className="flex-1">
          <label className="text-sm text-muted-foreground mb-1 block">Pattern</label>
          <Input placeholder="\b\w+\b" value={pattern} onChange={(e) => setPattern(e.target.value)} className="font-mono" />
        </div>
        <div className="w-32">
          <label className="text-sm text-muted-foreground mb-1 block">Flags</label>
          <Input value={flags} onChange={(e) => setFlags(e.target.value)} className="font-mono" placeholder="gi" />
        </div>
      </div>
      {error && <div className="text-red-400 text-sm mb-4 p-3 bg-red-400/10 rounded-lg">{error}</div>}
      <div className="mb-4">
        <label className="text-sm text-muted-foreground mb-1 block">Test Text</label>
        <Textarea value={text} onChange={(e) => setText(e.target.value)} className="min-h-[100px] font-mono text-sm" />
      </div>
      <div className="mb-4">
        <label className="text-sm text-muted-foreground mb-1 block">Highlighted Matches ({matches.length})</label>
        <div className="min-h-[60px] border border-border/50 rounded-lg p-3 bg-muted/20 text-sm font-mono whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: highlighted }} />
      </div>
      {matches.length > 0 && (
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">Match Details</label>
          <div className="space-y-2 max-h-60 overflow-auto">
            {matches.map((m, i) => (
              <div key={i} className="text-sm p-2 bg-muted/20 rounded border border-border/30">
                <span className="text-muted-foreground mr-2">#{i + 1}</span>
                <span className="font-mono text-primary">"{m[0]}"</span>
                <span className="text-muted-foreground ml-2">at index {m.index}</span>
                {m.length > 1 && (
                  <div className="mt-1 ml-4 space-y-1">
                    {m.slice(1).map((g, gi) => g !== undefined && (
                      <div key={gi} className="text-xs text-muted-foreground">Group {gi + 1}: <span className="text-foreground font-mono">"{g}"</span></div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </ToolLayout>
  );
}
