import { getToolBySlug } from '@/lib/tools-data';
import { AiToolShell } from '@/components/AiToolShell';

export default function AiSloganGenerator() {
  return <AiToolShell tool={getToolBySlug('ai-slogan-generator')!} />;
}
