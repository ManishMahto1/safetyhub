import { PlaceCategory } from './place.types';

export interface VoiceAssistRequestBody {
  transcript: string;
  location: { lat: number; lng: number } | null;
}

export interface VoiceAssistResponseBody {
  reply: string;
  suggestedCategory: PlaceCategory | null;
}
