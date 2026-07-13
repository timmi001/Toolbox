import { getToolBySlug } from '@/lib/tools-data';
import { AiToolShell } from '@/components/AiToolShell';

export default function AiParagraphRewriter() {
  return <AiToolShell tool={getToolBySlug('ai-paragraph-rewriter')!} />;
}
