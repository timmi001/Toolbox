import { useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export default function JsonValidator() {
  const tool = getToolBySlug('json-validator')!;
  const [input, setInput] = useState('');
  const [result, setResult] = useState<{ valid: boolean; message: string } | null>(null);

  function validate() {
    if (!input.trim()) return;
    try {
      JSON.parse(input);
      setResult({ valid: true, message: 'Valid JSON!' });
    } catch (e: unknown) {
      setResult({ valid: false, message: (e as Error).message });
    }
  }

  return (
    <ToolLayout tool={tool} instructions="Paste your JSON and click Validate to check if it's valid.">
      <Textarea
        placeholder='{"name": "John", "age": 30}'
        className="min-h-[280px] font-mono text-sm resize-y mb-4"
        value={input}
        onChange={(e) => { setInput(e.target.value); setResult(null); }}
      />
      {result && (
        <div className={`mb-4 p-4 rounded-lg border ${result.valid ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
          <div className="font-semibold text-lg mb-1">{result.valid ? 'Valid JSON' : 'Invalid JSON'}</div>
          <div className="text-sm font-mono">{result.message}</div>
        </div>
      )}
      <div className="flex gap-2">
        <Button onClick={validate} disabled={!input}>Validate</Button>
        <Button variant="outline" onClick={() => { setInput(''); setResult(null); }}>Reset</Button>
      </div>
    </ToolLayout>
  );
}
