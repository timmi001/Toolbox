import { Tool, getToolsByCategory } from '@/lib/tools-data';
import { ToolCard } from './ToolCard';

interface RelatedToolsProps {
  category: Tool['category'];
  currentSlug: string;
}

export function RelatedTools({ category, currentSlug }: RelatedToolsProps) {
  const related = getToolsByCategory(category)
    .filter(t => t.slug !== currentSlug)
    .slice(0, 4);

  if (related.length === 0) return null;

  return (
    <div className="mt-16">
      <h3 className="text-2xl font-bold mb-6 text-foreground tracking-tight">Related Tools</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {related.map(tool => (
          <ToolCard key={tool.slug} tool={tool} />
        ))}
      </div>
    </div>
  );
}
