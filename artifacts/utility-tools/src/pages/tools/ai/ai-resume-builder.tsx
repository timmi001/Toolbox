import { getToolBySlug } from '@/lib/tools-data';
import { AiToolShell } from '@/components/AiToolShell';

export default function AiResumeBuilder() {
  return <AiToolShell tool={getToolBySlug('ai-resume-builder')!} />;
}
