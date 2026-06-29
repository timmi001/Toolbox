import { useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function UrlParser() {
  const tool = getToolBySlug('url-parser')!;
  const [input, setInput] = useState('https://example.com:8080/path/page?name=John&age=30#section');
  const [parsed, setParsed] = useState<URL | null>(null);
  const [error, setError] = useState('');

  function parse() {
    try {
      setParsed(new URL(input));
      setError('');
    } catch {
      setError('Invalid URL');
      setParsed(null);
    }
  }

  const params = parsed ? Array.from(parsed.searchParams.entries()) : [];

  return (
    <ToolLayout tool={tool} instructions="Enter any URL to parse it into its components.">
      <div className="flex gap-2 mb-6">
        <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="https://example.com/path?q=test" className="font-mono" />
        <Button onClick={parse}>Parse</Button>
      </div>
      {error && <div className="text-red-400 text-sm mb-4 p-3 bg-red-400/10 rounded-lg">{error}</div>}
      {parsed && (
        <div className="space-y-3">
          {[
            ['Protocol', parsed.protocol],
            ['Hostname', parsed.hostname],
            ['Port', parsed.port || '(default)'],
            ['Pathname', parsed.pathname],
            ['Search', parsed.search || '(none)'],
            ['Hash', parsed.hash || '(none)'],
            ['Origin', parsed.origin],
            ['Host', parsed.host],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg border border-border/30">
              <span className="text-sm text-muted-foreground w-24 shrink-0">{label}</span>
              <span className="font-mono text-sm text-foreground break-all">{value}</span>
            </div>
          ))}
          {params.length > 0 && (
            <div className="p-3 bg-muted/20 rounded-lg border border-border/30">
              <div className="text-sm text-muted-foreground mb-2">Query Parameters</div>
              <div className="space-y-1">
                {params.map(([k, v]) => (
                  <div key={k} className="flex gap-2 font-mono text-sm">
                    <span className="text-blue-400">{k}</span>
                    <span className="text-muted-foreground">=</span>
                    <span className="text-green-400">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </ToolLayout>
  );
}
