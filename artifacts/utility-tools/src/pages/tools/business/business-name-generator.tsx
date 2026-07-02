import { useEffect, useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

const PREFIXES = ['North', 'Bright', 'Nova', 'Summit', 'Apex', 'Harbor'];
const SUFFIXES = ['Labs', 'Works', 'Studio', 'Co', 'Collective', 'Group'];
const WORDS = ['Craft', 'Flow', 'Signal', 'Launch', 'Forge', 'Orbit'];

export default function BusinessNameGenerator() {
  const tool = getToolBySlug('business-name-generator')!;
  const [industry, setIndustry] = useState('Design');
  const [names, setNames] = useState<string[]>([]);

  const generate = () => {
    const ideas = Array.from({ length: 8 }, (_, index) => {
      const prefix = PREFIXES[(index + 1) % PREFIXES.length];
      const suffix = SUFFIXES[(index + 2) % SUFFIXES.length];
      const word = WORDS[(index + 3) % WORDS.length];
      return `${prefix}${word}${suffix}`;
    });
    setNames(ideas.map((name, index) => `${name} ${industry ? `• ${industry}` : ''}`.trim()));
  };

  useEffect(() => {
    generate();
  }, [industry]);

  return (
    <ToolLayout tool={tool} instructions="Describe your industry and generate fresh company name ideas instantly.">
      <div className="flex flex-wrap gap-3">
        <Input value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="Enter your industry" className="max-w-md" />
        <Button onClick={generate} className="gap-2">
          <Sparkles className="w-4 h-4" /> Generate Ideas
        </Button>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {names.map((name) => (
          <div key={name} className="rounded-xl border border-border/60 bg-muted/20 p-4 text-sm font-medium text-foreground">
            {name}
          </div>
        ))}
      </div>
    </ToolLayout>
  );
}
