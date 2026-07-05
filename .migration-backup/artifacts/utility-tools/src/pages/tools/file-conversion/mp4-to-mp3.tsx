import ConversionToolShell from '@/pages/tools/file-conversion/ConversionToolShell';

export default function Mp4ToMp3() {
  return (
    <ConversionToolShell
      slug="mp4-to-mp3"
      acceptedTypes="audio/*,video/*"
      outputLabel="MP3"
      outputExtension=".mp3"
      mimeType="audio/mpeg"
      description="Upload an MP4 or other media file and prepare an audio-focused output in a browser-friendly workflow."
    />
  );
}
