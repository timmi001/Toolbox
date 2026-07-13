import { getToolBySlug } from '@/lib/tools-data';
import { AiToolShell } from '@/components/AiToolShell';

export default function AiLinkedinPost() {
  return <AiToolShell tool={getToolBySlug('ai-linkedin-post')!} />;
}
