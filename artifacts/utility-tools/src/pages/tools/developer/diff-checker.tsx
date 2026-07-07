import { useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

type DiffLine = { type: 'same' | 'add' | 'remove'; line: string };

function diffLines(a: string, b: string): DiffLine[] {
  const aLines = a.split('\n');
  const bLines = b.split('\n');
  const m = aLines.length, n = bLines.length;

  // LCS dp table
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = aLines[i-1] === bLines[j-1] ? dp[i-1][j-1] + 1 : Math.max(dp[i-1][j], dp[i][j-1]);

  const result: DiffLine[] = [];
  let i = m, j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && aLines[i-1] === bLines[j-1]) {
      result.unshift({ type: 'same', line: aLines[i-1] });
      i--; j--;
    } else if (j > 0 && (i === 0 || dp[i][j-1] >= dp[i-1][j])) {
      result.unshift({ type: 'add', line: bLines[j-1] });
      j--;
    } else {
      result.unshift({ type: 'remove', line: aLines[i-1] });
      i--;
    }
  }
  return result;
}

const BG: Record<DiffLine['type'], string> = {
  same: '',
  add: 'bg-green-50 dark:bg-green-950/40 text-green-800 dark:text-green-300',
  remove: 'bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300',
};
const PREFIX: Record<DiffLine['type'], string> = { same: '  ', add: '+ ', remove: '- ' };

export default function DiffChecker() {
  const tool = getToolBySlug('diff-checker')!;
  const [left, setLeft] = useState('');
  const [right, setRight] = useState('');
  const [diff, setDiff] = useState<DiffLine[] | null>(null);

  function compare() {
    setDiff(diffLines(left, right));
  }

  const added = diff?.filter(d => d.type === 'add').length ?? 0;
  const removed = diff?.filter(d => d.type === 'remove').length ?? 0;

  return (
    <ToolLayout tool={tool} instructions="Paste two blocks of text and click Compare to highlight differences line by line.">
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">Original (Left)</label>
          <Textarea
            className="min-h-[260px] font-mono text-sm resize-y"
            placeholder="Paste original text here…"
            value={left}
            onChange={e => setLeft(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">Changed (Right)</label>
          <Textarea
            className="min-h-[260px] font-mono text-sm resize-y"
            placeholder="Paste changed text here…"
            value={right}
            onChange={e => setRight(e.target.value)}
          />
        </div>
      </div>
      <div className="flex gap-2 mb-6">
        <Button onClick={compare}>Compare</Button>
        <Button variant="outline" onClick={() => { setLeft(''); setRight(''); setDiff(null); }}>Reset</Button>
      </div>

      {diff !== null && (
        <div>
          <div className="flex gap-4 text-sm mb-3">
            <span className="text-green-600 dark:text-green-400 font-medium">+ {added} added</span>
            <span className="text-red-600 dark:text-red-400 font-medium">− {removed} removed</span>
            <span className="text-muted-foreground">{diff.filter(d => d.type === 'same').length} unchanged</span>
          </div>
          <div className="rounded-lg border overflow-auto max-h-[500px]">
            {diff.length === 0 ? (
              <p className="p-4 text-center text-muted-foreground text-sm">The two texts are identical.</p>
            ) : (
              <table className="w-full text-xs font-mono">
                <tbody>
                  {diff.map((d, i) => (
                    <tr key={i} className={BG[d.type]}>
                      <td className="px-2 py-0.5 select-none text-muted-foreground border-r w-6 text-right">{i + 1}</td>
                      <td className="px-2 py-0.5 select-none border-r w-6 text-center font-bold">{PREFIX[d.type]}</td>
                      <td className="px-3 py-0.5 whitespace-pre">{d.line}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </ToolLayout>
  );
}
