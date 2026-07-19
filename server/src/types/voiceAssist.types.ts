import { PlaceCategory } from './place.types';

export interface VoiceAssistRequestBody {
  transcript: string;
  location: { lat: number; lng: number } | null;
  /** Human-readable language name the assistant should reply in (e.g. "Spanish"). */
  language?: string;
}

export interface VoiceAssistResponseBody {
  reply: string;
  suggestedCategory: PlaceCategory | null;
}
