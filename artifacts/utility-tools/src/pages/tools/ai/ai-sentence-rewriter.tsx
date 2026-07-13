import { getToolBySlug } from '@/lib/tools-data';
import { AiToolShell } from '@/components/AiToolShell';

export default function AiSentenceRewriter() {
  return <AiToolShell tool={getToolBySlug('ai-sentence-rewriter')!} />;
}
