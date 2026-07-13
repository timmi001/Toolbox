import { getToolBySlug } from '@/lib/tools-data';
import { AiToolShell } from '@/components/AiToolShell';

export default function AiTextImprover() {
  return <AiToolShell tool={getToolBySlug('ai-text-improver')!} />;
}
