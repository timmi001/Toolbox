import { getToolBySlug } from '@/lib/tools-data';
import { AiToolShell } from '@/components/AiToolShell';

export default function AiLetterWriter() {
  return <AiToolShell tool={getToolBySlug('ai-letter-writer')!} />;
}
