import { useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export default function JsonMinifier() {
  const tool = getToolBySlug('json-minifier')!;
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  function minify() {
    try {
      const parsed = JSON.parse(input);
      const minified = JSON.stringify(parsed);
      setOutput(minified);
      setError('');
    } catch (e: unknown) {
      setError((e as Error).message);
      setOutput('');
    }
  }

  function copy() {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const reduction = input && output ? (((input.length - output.length) / input.length) * 100).toFixed(1) : null;

  return (
    <ToolLayout tool={tool} instructions="Paste formatted JSON and click Minify to compress it.">
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">Formatted JSON ({input.length} chars)</label>
          <Textarea placeholder="Paste formatted JSON here..." className="min-h-[280px] font-mono text-sm resize-y" value={input} onChange={(e) => { setInput(e.target.value); setOutput(''); }} />
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">Minified Output {output ? `(${output.length} chars)` : ''}</label>
          <Textarea readOnly value={output} className="min-h-[280px] font-mono text-sm resize-y bg-muted/30" placeholder="Minified JSON will appear here..." />
        </div>
      </div>
      {reduction && <div className="mb-4 text-sm text-green-400 font-medium">Size reduced by {reduction}%</div>}
      {error && <div className="text-red-400 text-sm mb-4 p-3 bg-red-400/10 rounded-lg">{error}</div>}
      <div className="flex gap-2">
        <Button onClick={minify} disabled={!input}>Minify</Button>
        <Button variant="outline" onClick={copy} disabled={!output}>{copied ? 'Copied!' : 'Copy'}</Button>
        <Button variant="outline" onClick={() => { setInput(''); setOutput(''); setError(''); }}>Reset</Button>
      </div>
    </ToolLayout>
  );
}
