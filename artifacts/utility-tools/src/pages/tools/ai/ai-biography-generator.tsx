import { getToolBySlug } from '@/lib/tools-data';
import { AiToolShell } from '@/components/AiToolShell';

export default function AiBiographyGenerator() {
  return <AiToolShell tool={getToolBySlug('ai-biography-generator')!} />;
}
