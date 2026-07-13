import { getToolBySlug } from '@/lib/tools-data';
import { AiToolShell } from '@/components/AiToolShell';

export default function AiLinkedinHeadline() {
  return <AiToolShell tool={getToolBySlug('ai-linkedin-headline')!} />;
}
