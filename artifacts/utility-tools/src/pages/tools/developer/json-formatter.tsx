import { useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

function syntaxHighlight(json: string) {
  return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g, (match) => {
    let cls = 'text-yellow-400';
    if (/^"/.test(match)) cls = /:$/.test(match) ? 'text-blue-400' : 'text-green-400';
    else if (/true|false/.test(match)) cls = 'text-purple-400';
    else if (/null/.test(match)) cls = 'text-red-400';
    return `<span class="${cls}">${match}</span>`;
  });
}

export default function JsonFormatter() {
  const tool = getToolBySlug('json-formatter')!;
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [indent, setIndent] = useState(2);
  const [copied, setCopied] = useState(false);

  function format() {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, indent));
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
    <ToolLayout tool={tool} instructions="Paste your JSON, select indent size, then click Format.">
      <div className="flex gap-2 mb-4">
        {[2, 4].map(n => (
          <Button key={n} variant={indent === n ? 'default' : 'outline'} onClick={() => setIndent(n)} className="w-24">
            {n} spaces
          </Button>
        ))}
        <Button variant={indent === 0 ? 'default' : 'outline'} onClick={() => setIndent(0)} className="w-24">Tab</Button>
      </div>
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">Input JSON</label>
          <Textarea placeholder='{"key": "value"}' className="min-h-[300px] font-mono text-sm resize-y" value={input} onChange={(e) => setInput(e.target.value)} />
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">Formatted Output</label>
          <pre
            className="min-h-[300px] border border-border/50 rounded-lg p-3 bg-muted/20 overflow-auto text-sm font-mono"
            dangerouslySetInnerHTML={{ __html: output ? syntaxHighlight(output.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')) : '<span class="text-muted-foreground">Output appears here...</span>' }}
          />
        </div>
      </div>
      {error && <div className="text-red-400 text-sm mb-4 p-3 bg-red-400/10 rounded-lg">{error}</div>}
      <div className="flex gap-2">
        <Button onClick={format} disabled={!input}>Format</Button>
        <Button variant="outline" onClick={copy} disabled={!output}>{copied ? 'Copied!' : 'Copy'}</Button>
        <Button variant="outline" onClick={() => { setInput(''); setOutput(''); setError(''); }}>Reset</Button>
      </div>
    </ToolLayout>
  );
}
