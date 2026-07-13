import { getToolBySlug } from '@/lib/tools-data';
import { AiToolShell } from '@/components/AiToolShell';

export default function AiArticleRewriter() {
  return <AiToolShell tool={getToolBySlug('ai-article-rewriter')!} />;
}
