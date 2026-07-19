import OpenAI from 'openai';
import { env } from '../config/env';
import { VOICE_ASSIST_SYSTEM_PROMPT } from '../prompts/voiceAssistSystemPrompt';
import { PlaceCategory } from '../types/place.types';
import { keywordGuidance, GuidanceResult } from './fallbackGuidance';

const client = env.openaiApiKey ? new OpenAI({ apiKey: env.openaiApiKey }) : null;

const VALID_CATEGORIES: PlaceCategory[] = [
  'hospital',
  'pharmacy',
  'police',
  'bank',
  'fuel',
  'fire-station',
];

/**
 * Calls the LLM with the guidance-only system prompt. Never returns anything
 * that implies an action was taken — see voiceAssistSystemPrompt.ts.
 *
 * Degrades gracefully: if no API key is configured, or the OpenAI call fails
 * (rate limit, timeout, bad key, network), it falls back to deterministic
 * keyword guidance so the assistant stays useful and the demo never dies.
 */
export async function getVoiceGuidance(
  transcript: string,
  location: { lat: number; lng: number } | null,
  language?: string
): Promise<GuidanceResult> {
  if (!client) {
    // Keyword fallback replies in English only — see note in Roadmap Phase 6.
    return keywordGuidance(transcript);
  }

  const locationLine = location
    ? `User location: ${location.lat}, ${location.lng}`
    : 'User location: unknown';
  const languageLine =
    language && language !== 'English'
      ? `\nReply in this language: ${language}. Keep the JSON keys and the category value in English.`
      : '';
  const userContent = `Transcript: "${transcript}"\n${locationLine}${languageLine}`;

  try {
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

    // If the model gave us nothing usable, fall back to keyword guidance
    // rather than a vague apology.
    if (!parsed.reply?.trim()) {
      return keywordGuidance(transcript);
    }

    return { reply: parsed.reply.trim(), suggestedCategory: category };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[voice-assist] OpenAI call failed, using keyword fallback:', (err as Error).message);
    return keywordGuidance(transcript);
  }
}
