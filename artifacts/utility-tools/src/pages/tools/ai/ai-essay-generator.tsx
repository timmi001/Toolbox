import { getToolBySlug } from '@/lib/tools-data';
import { LocalToolShell } from '@/components/LocalToolShell';

export default function AiEssayGenerator() {
  return <AiToolShell tool={getToolBySlug('ai-essay-generator')!} />;
}
