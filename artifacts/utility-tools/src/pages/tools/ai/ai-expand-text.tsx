import { getToolBySlug } from '@/lib/tools-data';
import { AiToolShell } from '@/components/AiToolShell';

export default function AiExpandText() {
  return <AiToolShell tool={getToolBySlug('ai-expand-text')!} />;
}
