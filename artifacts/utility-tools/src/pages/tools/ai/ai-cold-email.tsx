import { getToolBySlug } from '@/lib/tools-data';
import { AiToolShell } from '@/components/AiToolShell';

export default function AiColdEmail() {
  return <AiToolShell tool={getToolBySlug('ai-cold-email')!} />;
}
