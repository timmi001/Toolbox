import { getToolBySlug } from '@/lib/tools-data';
import { AiToolShell } from '@/components/AiToolShell';

export default function AiCompanyBio() {
  return <AiToolShell tool={getToolBySlug('ai-company-bio')!} />;
}
