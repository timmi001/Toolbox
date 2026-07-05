import { useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';

const WORDS = ['the','be','to','of','and','a','in','that','have','it','for','not','on','with','he','as','you','do','at','this','but','his','by','from','they','we','say','her','she','or','an','will','my','one','all','would','there','their','what','so','up','out','if','about','who','get','which','go','me','when','make','can','like','time','no','just','him','know','take','people','into','year','your','good','some','could','them','see','other','than','then','now','look','only','come','its','over','think','also','back','after','use','two','how','our','work','first','well','way','even','new','want','because','any','these','give','day','most','us'];
const SENTENCES = ['The quick brown fox jumps over the lazy dog.','Pack my box with five dozen liquor jugs.','How vexingly quick daft zebras jump.','Sphinx of black quartz, judge my vow.','The five boxing wizards jump quickly.','Amazingly few discotheques provide jukeboxes.','Jackdaws love my big sphinx of quartz.'];

function generateWords(count: number) {
  return Array.from({ length: count }, () => WORDS[Math.floor(Math.random() * WORDS.length)]).join(' ');
}
function generateSentences(count: number) {
  return Array.from({ length: count }, () => SENTENCES[Math.floor(Math.random() * SENTENCES.length)]).join(' ');
}
function generateParagraphs(count: number) {
  return Array.from({ length: count }, () => generateSentences(5 + Math.floor(Math.random() * 5))).join('\n\n');
}

export default function RandomTextGenerator() {
  const tool = getToolBySlug('random-text-generator')!;
  const [type, setType] = useState<'words' | 'sentences' | 'paragraphs'>('words');
  const [count, setCount] = useState(10);
  const [output, setOutput] = useState('');

  function generate() {
    if (type === 'words') setOutput(generateWords(count));
    else if (type === 'sentences') setOutput(generateSentences(count));
    else setOutput(generateParagraphs(count));
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(output);
  }

  return (
    <ToolLayout tool={tool} instructions="Select the type, quantity, then click Generate.">
      <div className="flex gap-2 mb-6">
        {(['words', 'sentences', 'paragraphs'] as const).map(t => (
          <Button key={t} variant={type === t ? 'default' : 'outline'} onClick={() => setType(t)} className="capitalize flex-1">
            {t}
          </Button>
        ))}
      </div>
      <div className="mb-6">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Count</span>
          <span className="text-foreground font-medium">{count}</span>
        </div>
        <Slider min={1} max={type === 'paragraphs' ? 10 : 100} value={[count]} onValueChange={([v]) => setCount(v)} />
      </div>
      <div className="flex gap-2 mb-4">
        <Button onClick={generate} className="flex-1">Generate</Button>
        <Button variant="outline" onClick={copyToClipboard} disabled={!output}>Copy</Button>
        <Button variant="outline" onClick={() => setOutput('')}>Reset</Button>
      </div>
      {output && (
        <Textarea value={output} readOnly className="min-h-[200px] resize-y bg-muted/30" />
      )}
    </ToolLayout>
  );
}
