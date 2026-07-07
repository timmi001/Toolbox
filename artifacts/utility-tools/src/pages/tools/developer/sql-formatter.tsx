import { useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

const CLAUSE_KEYWORDS = ['SELECT','FROM','WHERE','LEFT JOIN','RIGHT JOIN','INNER JOIN','OUTER JOIN','FULL OUTER JOIN','CROSS JOIN','JOIN','GROUP BY','ORDER BY','HAVING','LIMIT','OFFSET','UNION ALL','UNION','ON','SET','VALUES','INSERT INTO','UPDATE','DELETE FROM','CREATE TABLE','ALTER TABLE','DROP TABLE','WITH'];
const ALL_KEYWORDS = [...CLAUSE_KEYWORDS,'DISTINCT','AS','AND','OR','NOT','IN','EXISTS','BETWEEN','LIKE','IS NULL','IS NOT NULL','ASC','DESC','CASE','WHEN','THEN','ELSE','END','PRIMARY KEY','FOREIGN KEY','REFERENCES','CONSTRAINT','DEFAULT','UNIQUE','INDEX','COUNT','SUM','AVG','MIN','MAX','COALESCE','NULLIF','CAST','CONVERT'];

function formatSQL(raw: string): string {
  let s = raw.trim().replace(/\s+/g, ' ');
  // Uppercase all keywords
  ALL_KEYWORDS.forEach(kw => {
    s = s.replace(new RegExp(`(?<![\\w])${kw}(?![\\w])`, 'gi'), kw);
  });
  // Break before major clauses
  CLAUSE_KEYWORDS.forEach(kw => {
    s = s.replace(new RegExp(`(?<![\\w])${kw}(?![\\w])`, 'g'), `\n${kw}`);
  });
  return s.split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0)
    .map((l, i) => (i === 0 ? l : '  ' + l))
    .join('\n');
}

export default function SqlFormatter() {
  const tool = getToolBySlug('sql-formatter')!;
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  function format() { setOutput(formatSQL(input)); }

  function copy() {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <ToolLayout tool={tool} instructions="Paste your SQL query and click Format to beautify it.">
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">Input SQL</label>
          <Textarea
            className="min-h-[320px] font-mono text-sm resize-y"
            placeholder="SELECT * FROM users WHERE id = 1;"
            value={input}
            onChange={e => setInput(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">Formatted Output</label>
          <pre className="min-h-[320px] border border-border/50 rounded-lg p-3 bg-muted/20 overflow-auto text-sm font-mono whitespace-pre-wrap">
            {output || <span className="text-muted-foreground">Formatted SQL appears here…</span>}
          </pre>
        </div>
      </div>
      <div className="flex gap-2">
        <Button onClick={format} disabled={!input.trim()}>Format SQL</Button>
        <Button variant="outline" onClick={copy} disabled={!output}>{copied ? 'Copied!' : 'Copy'}</Button>
        <Button variant="outline" onClick={() => { setInput(''); setOutput(''); }}>Reset</Button>
      </div>
    </ToolLayout>
  );
}
