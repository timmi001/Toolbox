import { getToolBySlug } from '@/lib/tools-data';
import { AiToolShell } from '@/components/AiToolShell';

export default function AiKeywordGenerator() {
  return <AiToolShell tool={getToolBySlug('ai-keyword-generator')!} />;
}
