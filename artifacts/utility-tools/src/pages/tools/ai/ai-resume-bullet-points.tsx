import { getToolBySlug } from '@/lib/tools-data';
import { AiToolShell } from '@/components/AiToolShell';

export default function AiResumeBulletPoints() {
  return <AiToolShell tool={getToolBySlug('ai-resume-bullet-points')!} />;
}
