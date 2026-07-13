import { getToolBySlug } from '@/lib/tools-data';
import { AiToolShell } from '@/components/AiToolShell';

export default function AiToneChanger() {
  return <AiToolShell tool={getToolBySlug('ai-tone-changer')!} />;
}
