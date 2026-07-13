import { getToolBySlug } from '@/lib/tools-data';
import { AiToolShell } from '@/components/AiToolShell';

export default function AiProfessionalBio() {
  return <AiToolShell tool={getToolBySlug('ai-professional-bio')!} />;
}
