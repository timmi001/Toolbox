import { getToolBySlug } from '@/lib/tools-data';
import { AiToolShell } from '@/components/AiToolShell';

export default function AiHumanizer() {
  return <AiToolShell tool={getToolBySlug('ai-humanizer')!} />;
}
