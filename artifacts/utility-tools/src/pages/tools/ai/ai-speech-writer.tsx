import { getToolBySlug } from '@/lib/tools-data';
import { LocalToolShell } from '@/components/LocalToolShell';

function buildSpeech(topic: string, audience: string) {
  const cleanTopic = topic.trim() || 'a meaningful message';
  const cleanAudience = audience.trim() || 'the audience';
  return `Speech Draft\n\nTopic: ${cleanTopic}\nAudience: ${cleanAudience}\n\nGood evening everyone. Today I want to speak about ${cleanTopic}, because it is an issue that matters to all of us. I believe that with clarity, preparation, and commitment, we can make meaningful progress and create lasting impact.`;
}

export default function AiSpeechWriter() {
  return (
    <LocalToolShell
      tool={getToolBySlug('ai-speech-writer')!}
      fields={[
        { key: 'topic', label: 'Speech Topic', type: 'text', required: true, placeholder: 'e.g. The value of discipline' },
        { key: 'audience', label: 'Audience', type: 'text', placeholder: 'e.g. Students, team, conference' },
      ]}
      buttonLabel="Write Speech"
      generate={(inputs) => buildSpeech(inputs.topic ?? '', inputs.audience ?? '')}
      emptyState="Enter a topic and audience to draft a short speech."
      instructions="Use this tool to create opening speeches, presentations, or short talks."
    />
  );
}
