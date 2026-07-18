import { getToolBySlug } from '@/lib/tools-data';
import { AiToolShell } from '@/components/AiToolShell';

export default function AiSpeechWriter() {
  return <AiToolShell tool={getToolBySlug('ai-speech-writer')!} />;
}
