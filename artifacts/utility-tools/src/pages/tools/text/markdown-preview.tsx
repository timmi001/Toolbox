import { useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Textarea } from '@/components/ui/textarea';

function parseMarkdown(md: string): string {
  return md
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/^### (.+)$/gm, '<h3 class="text-xl font-bold mt-4 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold mt-6 mb-3">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold mt-6 mb-4">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code class="bg-muted px-1 rounded text-sm font-mono">$1</code>')
    .replace(/```[\w]*\n?([\s\S]*?)```/g, '<pre class="bg-muted p-4 rounded-lg overflow-x-auto my-4 text-sm font-mono"><code>$1</code></pre>')
    .replace(/^\> (.+)$/gm, '<blockquote class="border-l-4 border-primary pl-4 text-muted-foreground italic my-4">$1</blockquote>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li class="ml-4 list-decimal">$2</li>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary underline" target="_blank">$1</a>')
    .replace(/\n\n+/g, '</p><p class="my-3">')
    .replace(/^(?!<[h|p|b|l|c|a|e|s|u])/gm, '')
    .replace(/\n/g, '<br>');
}

const DEFAULT = `# Hello, Markdown!

This is a **live preview** of your markdown. Try editing!

## Features
- **Bold** and *italic* text
- \`inline code\`
- [Links](https://example.com)

> Blockquotes work too!

\`\`\`
code blocks
\`\`\`
`;

export default function MarkdownPreview() {
  const tool = getToolBySlug('markdown-preview')!;
  const [md, setMd] = useState(DEFAULT);

  return (
    <ToolLayout tool={tool} instructions="Type or paste Markdown on the left. See the live HTML preview on the right.">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">Markdown Input</label>
          <Textarea
            value={md}
            onChange={(e) => setMd(e.target.value)}
            className="min-h-[400px] font-mono text-sm resize-y"
            placeholder="# Start typing markdown..."
          />
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">Preview</label>
          <div
            className="min-h-[400px] border border-border/50 rounded-lg p-4 bg-muted/20 prose prose-invert max-w-none overflow-auto text-sm"
            dangerouslySetInnerHTML={{ __html: `<p class="my-3">${parseMarkdown(md)}</p>` }}
          />
        </div>
      </div>
    </ToolLayout>
  );
}
