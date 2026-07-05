import { useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

const STOP_WORDS = new Set(['the','a','an','and','or','but','in','on','at','to','for','of','with','by','from','is','are','was','were','be','been','being','have','has','had','do','does','did','will','would','could','should','may','might','shall','can','it','its','this','that','these','those','i','you','he','she','we','they','not','as','if','so','than','then','when','where','who','which','what','how','all','any','both','each','few','more','most','other','some','such','no','only','same','too','very','just','their','them','they','there','here','also','into','up','out','about','after','before','between','through','during','under','over','again','further','once']);

export default function KeywordDensity() {
  const tool = getToolBySlug('keyword-density')!;
  const [text, setText] = useState('');

  const words = text.toLowerCase().match(/\b[a-z]{2,}\b/g) || [];
  const total = words.length;
  const freq: Record<string, number> = {};
  words.forEach(w => {
    if (!STOP_WORDS.has(w)) freq[w] = (freq[w] || 0) + 1;
  });
  const top = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 15);

  return (
    <ToolLayout tool={tool} instructions="Paste your text to analyze keyword frequency and density. Common stop words are excluded.">
      <Textarea
        placeholder="Paste your text here..."
        className="min-h-[160px] mb-6 resize-y"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      {total > 0 && (
        <div>
          <div className="text-sm text-muted-foreground mb-4">
            Total words: <span className="text-foreground font-medium">{total}</span> | Unique keywords: <span className="text-foreground font-medium">{Object.keys(freq).length}</span>
          </div>
          <div className="space-y-2">
            {top.map(([word, count]) => {
              const density = ((count / total) * 100).toFixed(2);
              const pct = (count / (top[0]?.[1] || 1)) * 100;
              return (
                <div key={word} className="flex items-center gap-3">
                  <span className="w-32 text-sm font-medium truncate">{word}</span>
                  <div className="flex-1 bg-muted/30 rounded-full h-2 overflow-hidden">
                    <div className="bg-primary h-full rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-sm text-muted-foreground w-12 text-right">{count}x</span>
                  <span className="text-sm text-primary w-14 text-right">{density}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      <Button variant="outline" className="mt-4" onClick={() => setText('')}>Reset</Button>
    </ToolLayout>
  );
}
