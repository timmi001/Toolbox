import { getToolBySlug } from '@/lib/tools-data';
import { AiToolShell } from '@/components/AiToolShell';

export default function AiCodeExplainer() {
  return <AiToolShell tool={getToolBySlug('ai-code-explainer')!} />;
}
