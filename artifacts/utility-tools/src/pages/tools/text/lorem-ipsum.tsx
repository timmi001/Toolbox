import { useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { copyToClipboard } from '@/lib/helpers';
import { useToast } from '@/hooks/use-toast';

const WORDS = ["lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit", "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore", "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud", "exercitation", "ullamco", "laboris", "nisi", "ut", "aliquip", "ex", "ea", "commodo", "consequat", "duis", "aute", "irure", "dolor", "in", "reprehenderit", "in", "voluptate", "velit", "esse", "cillum", "dolore", "eu", "fugiat", "nulla", "pariatur", "excepteur", "sint", "occaecat", "cupidatat", "non", "proident", "sunt", "in", "culpa", "qui", "officia", "deserunt", "mollit", "anim", "id", "est", "laborum"];

export default function LoremIpsum() {
  const tool = getToolBySlug('lorem-ipsum')!;
  const [text, setText] = useState('');
  const [count, setCount] = useState(3);
  const [type, setType] = useState<'paragraphs' | 'sentences' | 'words'>('paragraphs');
  const { toast } = useToast();

  const generate = () => {
    let result = [];
    const getRandomWord = () => WORDS[Math.floor(Math.random() * WORDS.length)];
    
    if (type === 'words') {
      for(let i=0; i<count; i++) result.push(getRandomWord());
      setText(result.join(' '));
    } else if (type === 'sentences') {
      for(let i=0; i<count; i++) {
        const sentenceLen = Math.floor(Math.random() * 10) + 5;
        let sentence = Array.from({length: sentenceLen}, getRandomWord).join(' ');
        sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1) + '.';
        result.push(sentence);
      }
      setText(result.join(' '));
    } else {
      for(let i=0; i<count; i++) {
        let paragraph = [];
        const sentenceCount = Math.floor(Math.random() * 5) + 3;
        for(let j=0; j<sentenceCount; j++) {
          const sentenceLen = Math.floor(Math.random() * 10) + 5;
          let sentence = Array.from({length: sentenceLen}, getRandomWord).join(' ');
          sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1) + '.';
          paragraph.push(sentence);
        }
        result.push(paragraph.join(' '));
      }
      setText(result.join('\n\n'));
    }
  };

  const copy = async () => {
    await copyToClipboard(text);
    toast({ description: 'Copied to clipboard' });
  };

  return (
    <ToolLayout tool={tool} instructions="Select options to generate Lorem Ipsum text.">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <Label className="mb-4 block">Amount: {count}</Label>
          <Slider 
            value={[count]} 
            onValueChange={v => setCount(v[0])} 
            min={1} 
            max={100} 
            step={1} 
          />
        </div>
        <div className="flex items-end gap-2">
          <Button onClick={() => setType('paragraphs')} variant={type === 'paragraphs' ? 'default' : 'secondary'}>Paragraphs</Button>
          <Button onClick={() => setType('sentences')} variant={type === 'sentences' ? 'default' : 'secondary'}>Sentences</Button>
          <Button onClick={() => setType('words')} variant={type === 'words' ? 'default' : 'secondary'}>Words</Button>
        </div>
      </div>
      
      <div className="flex gap-2 mb-4">
        <Button onClick={generate}>Generate</Button>
        <Button onClick={copy} variant="secondary" className="ml-auto">Copy text</Button>
      </div>

      <Textarea
        readOnly
        className="min-h-[300px] resize-y text-base p-4 bg-muted/30"
        value={text}
      />
    </ToolLayout>
  );
}
