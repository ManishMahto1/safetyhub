import { api } from './api.js';

/**
 * Sends a transcribed utterance + location to the backend voice-assist route.
 * The backend returns guidance text (to be spoken + shown) and a suggested
 * map category to highlight — it never triggers SOS or any other action.
 *
 * @param {{ transcript: string, coords: {lat:number, lng:number} | null, language?: string }} payload
 *   language is the human-readable language name the assistant should reply in.
 * @returns {Promise<{ reply: string, suggestedCategory: string | null }>}
 */
export async function requestVoiceGuidance({ transcript, coords, language }) {
  const { data } = await api.post('/api/voice-assist', {
    transcript,
    location: coords ? { lat: coords.lat, lng: coords.lng } : null,
    language,
  });
  return data;
}
