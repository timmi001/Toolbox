import { useMemo, useRef, useState } from 'react';
import { CheckCircle2, Copy, Download, RotateCcw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ToolLayout } from '@/components/ToolLayout';
import { Tool } from '@/lib/tools-data';

export interface LocalToolField {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'select';
  placeholder?: string;
  options?: string[];
  required?: boolean;
  rows?: number;
}

interface LocalToolShellProps {
  tool: Tool;
  fields: LocalToolField[];
  generate: (inputs: Record<string, string>) => string;
  buttonLabel?: string;
  emptyState?: string;
  instructions?: string;
}

export function LocalToolShell({
  tool,
  fields,
  generate,
  buttonLabel = 'Generate',
  emptyState = 'Fill in the fields above and generate your result instantly.',
  instructions,
}: LocalToolShellProps) {
  const defaultInputs = useMemo(() => {
    const defaults: Record<string, string> = {};
    for (const field of fields) {
      if (field.type === 'select' && field.options?.[0]) {
        defaults[field.key] = field.options[0];
      }
    }
    return defaults;
  }, [fields]);

  const [inputs, setInputs] = useState<Record<string, string>>(defaultInputs);
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const setField = (key: string, value: string) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  const requiredFields = fields.filter(field => field.required);
  const canGenerate = requiredFields.every(field => (inputs[field.key] ?? '').trim().length > 0);

  const handleGenerate = () => {
    const nextResult = generate(inputs);
    setResult(nextResult);
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 80);
  };

  const copyResult = async () => {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const downloadResult = () => {
    const blob = new Blob([result], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${tool.slug}-result.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setInputs(defaultInputs);
    setResult('');
  };

  return (
    <ToolLayout
      tool={tool}
      instructions={instructions ?? `Fill in the fields below and click “${buttonLabel}” to generate a polished result instantly.`}
    >
      <div className="space-y-5 mb-6">
        {fields.map(field => (
          <div key={field.key}>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              {field.label}
              {field.required && <span className="text-primary ml-1">*</span>}
            </label>

            {field.type === 'textarea' && (
              <Textarea
                value={inputs[field.key] ?? ''}
                onChange={e => setField(field.key, e.target.value)}
                placeholder={field.placeholder}
                rows={field.rows ?? 6}
                className="min-h-[120px] resize-y font-mono text-sm"
              />
            )}

            {field.type === 'text' && (
              <Input
                value={inputs[field.key] ?? ''}
                onChange={e => setField(field.key, e.target.value)}
                placeholder={field.placeholder}
              />
            )}

            {field.type === 'select' && field.options && (
              <select
                value={inputs[field.key] ?? field.options[0]}
                onChange={e => setField(field.key, e.target.value)}
                className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {field.options.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <Button onClick={handleGenerate} disabled={!canGenerate} className="gap-2 bg-primary hover:bg-primary/90">
          <Sparkles className="w-4 h-4" /> {buttonLabel}
        </Button>
        {(result || (!canGenerate && fields.some(field => field.required))) && (
          <Button variant="outline" onClick={reset} className="gap-2">
            <RotateCcw className="w-4 h-4" /> Reset
          </Button>
        )}
      </div>

      {result && (
        <div ref={resultRef} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <CheckCircle2 className="w-4 h-4 text-primary" /> Result
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={copyResult} className="gap-1.5 h-8 text-xs">
                {copied ? <><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
              </Button>
              <Button variant="outline" size="sm" onClick={downloadResult} className="gap-1.5 h-8 text-xs">
                <Download className="w-3.5 h-3.5" /> Download
              </Button>
            </div>
          </div>
          <div className="bg-muted/30 border border-border rounded-lg p-4 text-sm text-foreground whitespace-pre-wrap leading-relaxed max-h-[600px] overflow-y-auto font-sans">
            {result}
          </div>
        </div>
      )}

      {!result && (
        <div className="text-center py-8 text-muted-foreground border-2 border-dashed border-border/50 rounded-xl">
          <Sparkles className="w-8 h-8 mx-auto mb-3 opacity-30" />
          <p className="text-sm">{emptyState}</p>
        </div>
      )}
    </ToolLayout>
  );
}
