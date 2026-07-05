import { useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Input } from '@/components/ui/input';

type Base = 2 | 8 | 10 | 16;

export default function BinaryCalculator() {
  const tool = getToolBySlug('binary-calculator')!;
  const [a, setA] = useState('1010');
  const [b, setB] = useState('0110');
  const [base, setBase] = useState<Base>(2);
  const [op, setOp] = useState<'+' | '-' | '×' | '÷' | 'AND' | 'OR' | 'XOR'>('+');

  function parse(v: string): number {
    const n = parseInt(v, base);
    return isNaN(n) ? 0 : n;
  }

  const na = parse(a), nb = parse(b);
  let result: number | null = null;
  if (op === '+') result = na + nb;
  else if (op === '-') result = na - nb;
  else if (op === '×') result = na * nb;
  else if (op === '÷') result = nb !== 0 ? Math.floor(na / nb) : null;
  else if (op === 'AND') result = na & nb;
  else if (op === 'OR') result = na | nb;
  else if (op === 'XOR') result = na ^ nb;

  function toBase(n: number, b: Base) {
    if (n < 0) return '-' + Math.abs(n).toString(b).toUpperCase();
    return n.toString(b).toUpperCase();
  }

  const baseName = { 2: 'Binary', 8: 'Octal', 10: 'Decimal', 16: 'Hexadecimal' }[base];

  return (
    <ToolLayout tool={tool} instructions="Enter numbers in selected base. Supports arithmetic and bitwise operations.">
      <div className="flex gap-2 mb-6">
        {([2, 8, 10, 16] as Base[]).map(b => (
          <button key={b} onClick={() => setBase(b)} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${base === b ? 'bg-primary text-primary-foreground' : 'bg-muted/30 hover:bg-muted/50'}`}>
            {b === 2 ? 'Bin' : b === 8 ? 'Oct' : b === 10 ? 'Dec' : 'Hex'}
          </button>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Value A ({baseName})</label>
          <Input value={a} onChange={(e) => setA(e.target.value)} className="font-mono" placeholder={base === 16 ? 'FF' : base === 2 ? '1010' : '10'} />
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Value B ({baseName})</label>
          <Input value={b} onChange={(e) => setB(e.target.value)} className="font-mono" />
        </div>
      </div>
      <div className="flex gap-2 mb-6 flex-wrap">
        {(['+', '-', '×', '÷', 'AND', 'OR', 'XOR'] as const).map(o => (
          <button key={o} onClick={() => setOp(o)} className={`px-4 py-2 rounded-lg text-sm font-mono font-medium ${op === o ? 'bg-primary text-primary-foreground' : 'bg-muted/30 hover:bg-muted/50'}`}>{o}</button>
        ))}
      </div>
      {result !== null && (
        <div className="space-y-3">
          <div className="text-sm text-muted-foreground mb-2">Result: {toBase(na, base)} {op} {toBase(nb, base)}</div>
          {([2, 8, 10, 16] as Base[]).map(b2 => (
            <div key={b2} className={`flex justify-between p-3 rounded-lg border ${b2 === base ? 'bg-primary/10 border-primary/30' : 'bg-muted/20 border-border/30'}`}>
              <span className="text-sm text-muted-foreground">{{ 2: 'Binary', 8: 'Octal', 10: 'Decimal', 16: 'Hex' }[b2]}</span>
              <span className="font-mono text-sm font-semibold">{toBase(result!, b2)}</span>
            </div>
          ))}
        </div>
      )}
      {result === null && nb === 0 && op === '÷' && <div className="text-red-400 text-sm">Division by zero</div>}
    </ToolLayout>
  );
}
