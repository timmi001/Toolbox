import { getToolBySlug } from '@/lib/tools-data';
import { AiToolShell } from '@/components/AiToolShell';

export default function AiProofreader() {
  return <AiToolShell tool={getToolBySlug('ai-proofreader')!} />;
}
