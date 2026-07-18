import { getToolBySlug } from '@/lib/tools-data';
import { AiToolShell } from '@/components/AiToolShell';

export default function AiEssayGenerator() {
  return <AiToolShell tool={getToolBySlug('ai-essay-generator')!} />;
}
