import { getToolBySlug } from '@/lib/tools-data';
import { AiToolShell } from '@/components/AiToolShell';

export default function AiThankYouEmail() {
  return <AiToolShell tool={getToolBySlug('ai-thank-you-email')!} />;
}
