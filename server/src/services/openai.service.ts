import OpenAI from 'openai';
import { env } from '../config/env';
import { VOICE_ASSIST_SYSTEM_PROMPT } from '../prompts/voiceAssistSystemPrompt';
import { PlaceCategory } from '../types/place.types';

const client = env.openaiApiKey ? new OpenAI({ apiKey: env.openaiApiKey }) : null;

const VALID_CATEGORIES: PlaceCategory[] = [
  'hospital',
  'pharmacy',
  'police',
  'bank',
  'fuel',
  'fire-station',
];

interface GuidanceResult {
  reply: string;
  suggestedCategory: PlaceCategory | null;
}

/**
 * Calls the LLM with the guidance-only system prompt. Never returns anything
 * that implies an action was taken — see voiceAssistSystemPrompt.ts.
 */
export async function getVoiceGuidance(
  transcript: string,
  location: { lat: number; lng: number } | null
): Promise<GuidanceResult> {
  if (!client) {
    return {
      reply:
        "Voice guidance isn't configured on this server yet. You can still use the map and emergency numbers directly.",
      suggestedCategory: null,
    };
  }

  const userContent = location
    ? `Transcript: "${transcript}"\nUser location: ${location.lat}, ${location.lng}`
    : `Transcript: "${transcript}"\nUser location: unknown`;

  const completion = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.3,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: VOICE_ASSIST_SYSTEM_PROMPT },
      { role: 'user', content: userContent },
    ],
  });

  const raw = completion.choices[0]?.message?.content || '{}';

  let parsed: { reply?: string; category?: string | null };
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = {};
  }

  const category = VALID_CATEGORIES.includes(parsed.category as PlaceCategory)
    ? (parsed.category as PlaceCategory)
    : null;

  return {
    reply:
      parsed.reply?.trim() ||
      "I heard you, but I'm not sure what kind of help you need. Could you say a bit more?",
    suggestedCategory: category,
  };
}
