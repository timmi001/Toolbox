import { getToolBySlug } from '@/lib/tools-data';
import { AiToolShell } from '@/components/AiToolShell';

export default function AiHomeworkHelper() {
  return <AiToolShell tool={getToolBySlug('ai-homework-helper')!} />;
}
