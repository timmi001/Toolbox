import { getToolBySlug } from '@/lib/tools-data';
import { AiToolShell } from '@/components/AiToolShell';

export default function AiScriptWriter() {
  return <AiToolShell tool={getToolBySlug('ai-script-writer')!} />;
}
