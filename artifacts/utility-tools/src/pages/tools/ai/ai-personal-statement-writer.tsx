import { getToolBySlug } from '@/lib/tools-data';
import { AiToolShell } from '@/components/AiToolShell';

export default function AiPersonalStatementWriter() {
  return <AiToolShell tool={getToolBySlug('ai-personal-statement-writer')!} />;
}
