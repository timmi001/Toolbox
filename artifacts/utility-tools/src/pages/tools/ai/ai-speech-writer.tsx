import { getToolBySlug } from '@/lib/tools-data';
import { LocalToolShell } from '@/components/LocalToolShell';

export default function AiSpeechWriter() {
  return <AiToolShell tool={getToolBySlug('ai-speech-writer')!} />;
}
