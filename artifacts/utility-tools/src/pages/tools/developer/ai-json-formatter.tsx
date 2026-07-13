import { getToolBySlug } from '@/lib/tools-data';
import { AiToolShell } from '@/components/AiToolShell';

export default function AiJsonFormatter() {
  return <AiToolShell tool={getToolBySlug('ai-json-formatter')!} />;
}
