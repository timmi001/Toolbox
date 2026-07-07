import { useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

function minifySQL(sql: string): string {
  return sql
    .replace(/--[^\n]*/g, '')           // remove line comments
    .replace(/\/\*[\s\S]*?\*\//g, '')   // remove block comments
    .replace(/\s+/g, ' ')               // collapse whitespace
    .trim();
}

export default function SqlMinifier() {
  const tool = getToolBySlug('sql-minifier')!;
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  const savings = input.length > 0 && output.length > 0
    ? Math.round((1 - output.length / input.length) * 100)
    : 0;

  function minify() { setOutput(minifySQL(input)); }

  function copy() {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <ToolLayout tool={tool} instructions="Paste your SQL, click Minify to remove comments and collapse whitespace.">
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">Input SQL</label>
          <Textarea
            className="min-h-[300px] font-mono text-sm resize-y"
            placeholder={"-- Get active users\nSELECT\n  id,\n  name\nFROM users\nWHERE active = 1;"}
            value={input}
            onChange={e => setInput(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">Minified Output</label>
          <Textarea
            className="min-h-[300px] font-mono text-sm resize-y bg-muted/20"
            readOnly
            value={output}
            placeholder="Minified SQL appears here…"
          />
        </div>
      </div>
      {output && (
        <div className="flex gap-4 mb-4 text-sm text-muted-foreground">
          <span>Before: <strong>{input.length}</strong> chars</span>
          <span>After: <strong>{output.length}</strong> chars</span>
          {savings > 0 && <span className="text-green-500 font-medium">↓ {savings}% smaller</span>}
        </div>
      )}
      <div className="flex gap-2">
        <Button onClick={minify} disabled={!input.trim()}>Minify SQL</Button>
        <Button variant="outline" onClick={copy} disabled={!output}>{copied ? 'Copied!' : 'Copy'}</Button>
        <Button variant="outline" onClick={() => { setInput(''); setOutput(''); }}>Reset</Button>
      </div>
    </ToolLayout>
  );
}
