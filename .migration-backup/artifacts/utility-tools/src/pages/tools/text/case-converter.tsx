import { useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { copyToClipboard } from '@/lib/helpers';
import { useToast } from '@/hooks/use-toast';

export default function CaseConverter() {
  const tool = getToolBySlug('case-converter')!;
  const [text, setText] = useState('');
  const { toast } = useToast();

  const handleCase = (type: string) => {
    let result = text;
    switch (type) {
      case 'upper':
        result = text.toUpperCase();
        break;
      case 'lower':
        result = text.toLowerCase();
        break;
      case 'title':
        result = text.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        break;
      case 'sentence':
        result = text.toLowerCase().replace(/(^\s*\w|[\.\!\?]\s*\w)/g, c => c.toUpperCase());
        break;
      case 'camel':
        result = text.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
          return index === 0 ? word.toLowerCase() : word.toUpperCase();
        }).replace(/\s+/g, '');
        break;
      case 'snake':
        result = text.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)?.map(x => x.toLowerCase()).join('_') || text;
        break;
      case 'kebab':
        result = text.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)?.map(x => x.toLowerCase()).join('-') || text;
        break;
    }
    setText(result);
  };

  const copy = async () => {
    await copyToClipboard(text);
    toast({ description: 'Copied to clipboard' });
  };

  return (
    <ToolLayout tool={tool} instructions="Enter text and click a button to convert its case.">
      <div className="flex flex-wrap gap-2 mb-6">
        <Button onClick={() => handleCase('upper')} variant="secondary">UPPERCASE</Button>
        <Button onClick={() => handleCase('lower')} variant="secondary">lowercase</Button>
        <Button onClick={() => handleCase('title')} variant="secondary">Title Case</Button>
        <Button onClick={() => handleCase('sentence')} variant="secondary">Sentence case</Button>
        <Button onClick={() => handleCase('camel')} variant="secondary">camelCase</Button>
        <Button onClick={() => handleCase('snake')} variant="secondary">snake_case</Button>
        <Button onClick={() => handleCase('kebab')} variant="secondary">kebab-case</Button>
        <Button onClick={copy} className="ml-auto">Copy text</Button>
      </div>
      <Textarea
        placeholder="Type or paste your text here..."
        className="min-h-[300px] resize-y text-base p-4"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
    </ToolLayout>
  );
}
