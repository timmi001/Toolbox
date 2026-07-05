import { useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export default function JsonBeautifier() {
  const tool = getToolBySlug('json-beautifier')!;
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [indent, setIndent] = useState<number | string>(2);
  const [copied, setCopied] = useState(false);

  function beautify() {
    try {
      const parsed = JSON.parse(input);
      const space = indent === 'tab' ? '\t' : Number(indent);
      setOutput(JSON.stringify(parsed, null, space));
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

  return (
    <ToolLayout tool={tool} instructions="Paste minified or messy JSON. Select indentation style and click Beautify.">
      <div className="flex gap-2 mb-4">
        {[2, 4, 'tab'].map(n => (
          <Button key={n} variant={indent === n ? 'default' : 'outline'} onClick={() => setIndent(n)} className="flex-1">
            {n === 'tab' ? 'Tab' : `${n} spaces`}
          </Button>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">Input JSON</label>
          <Textarea placeholder='{"key":"value","arr":[1,2,3]}' className="min-h-[280px] font-mono text-sm resize-y" value={input} onChange={(e) => { setInput(e.target.value); setOutput(''); }} />
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">Beautified Output</label>
          <Textarea readOnly value={output} className="min-h-[280px] font-mono text-sm resize-y bg-muted/30" placeholder="Beautified JSON will appear here..." />
        </div>
      </div>
      {error && <div className="text-red-400 text-sm mb-4 p-3 bg-red-400/10 rounded-lg">{error}</div>}
      <div className="flex gap-2">
        <Button onClick={beautify} disabled={!input}>Beautify</Button>
        <Button variant="outline" onClick={copy} disabled={!output}>{copied ? 'Copied!' : 'Copy'}</Button>
        <Button variant="outline" onClick={() => { setInput(''); setOutput(''); setError(''); }}>Reset</Button>
      </div>
    </ToolLayout>
  );
}
