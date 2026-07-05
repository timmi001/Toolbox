import { useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';

export default function UuidGenerator() {
  const tool = getToolBySlug('uuid-generator')!;
  const [count, setCount] = useState(5);
  const [uuids, setUuids] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  function generate() {
    setUuids(Array.from({ length: count }, () => crypto.randomUUID()));
  }

  function copyAll() {
    navigator.clipboard.writeText(uuids.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <ToolLayout tool={tool} instructions="Choose how many UUIDs to generate and click Generate.">
      <div className="mb-6">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Count</span>
          <span className="text-foreground font-medium">{count}</span>
        </div>
        <Slider min={1} max={100} value={[count]} onValueChange={([v]) => setCount(v)} />
      </div>
      <div className="flex gap-2 mb-4">
        <Button onClick={generate} className="flex-1">Generate UUIDs</Button>
        <Button variant="outline" onClick={copyAll} disabled={uuids.length === 0}>{copied ? 'Copied!' : 'Copy All'}</Button>
      </div>
      {uuids.length > 0 && (
        <div className="space-y-2">
          {uuids.map((uuid, i) => (
            <div key={i} className="flex items-center gap-2 bg-muted/30 border border-border/50 rounded-lg p-3 font-mono text-sm group">
              <span className="text-muted-foreground w-6 text-center">{i + 1}</span>
              <span className="flex-1 text-foreground select-all">{uuid}</span>
              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100" onClick={() => navigator.clipboard.writeText(uuid)}>Copy</Button>
            </div>
          ))}
        </div>
      )}
    </ToolLayout>
  );
}
