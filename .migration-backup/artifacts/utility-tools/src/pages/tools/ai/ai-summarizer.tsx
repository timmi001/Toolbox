import { getToolBySlug } from '@/lib/tools-data';
import { AiToolShell } from '@/components/AiToolShell';

export default function AiSummarizer() {
  return <AiToolShell tool={getToolBySlug('ai-summarizer')!} />;
}
