import { ai } from './api';

export type HubId = 'ai-assistant' | 'creator' | 'study' | 'career' | 'business';

export interface HubGenerationInput {
  prompt: string;
  mode?: string;
  context?: string;
  subject?: string;
  level?: string;
  role?: string;
  industry?: string;
  experience?: string;
  businessType?: string;
}

export async function generateHubResponse(hub: HubId, input: HubGenerationInput): Promise<string> {
  const prompt = input.prompt.trim();
  if (!prompt) throw new Error('Enter a request before generating a response.');
  if (prompt.length > 12000) throw new Error('Your request is too long. Please keep it under 12,000 characters.');

  const response = await ai.generate({
    toolId: `hub-${hub}`,
    inputs: Object.fromEntries(
      Object.entries(input).filter(([, value]) => typeof value === 'string' && value.trim().length > 0),
    ),
  });

  if (!response.result?.trim()) throw new Error('The AI provider returned an empty response. Please retry.');
  return response.result;
}
