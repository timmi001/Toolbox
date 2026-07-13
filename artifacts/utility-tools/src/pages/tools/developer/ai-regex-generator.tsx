import { getToolBySlug } from '@/lib/tools-data';
import { AiToolShell } from '@/components/AiToolShell';

export default function AiRegexGenerator() {
  return <AiToolShell tool={getToolBySlug('ai-regex-generator')!} />;
}
