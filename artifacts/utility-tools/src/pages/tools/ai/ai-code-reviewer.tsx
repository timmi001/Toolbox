import { getToolBySlug } from '@/lib/tools-data';
import { AiToolShell } from '@/components/AiToolShell';

export default function AiCodeReviewer() {
  return <AiToolShell tool={getToolBySlug('ai-code-reviewer')!} />;
}
