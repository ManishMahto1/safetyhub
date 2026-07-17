import { Schema, model, Document } from 'mongoose';

/**
 * Purely for demo/stat purposes ("how many people used the assistant during
 * the demo") — not required for the app to function, and never stores
 * anything beyond what's needed to show that.
 */
export interface VoiceLogDocument extends Document {
  transcript: string;
  reply: string;
  suggestedCategory: string | null;
  hadLocation: boolean;
  createdAt: Date;
}

const VoiceLogSchema = new Schema<VoiceLogDocument>({
  transcript: { type: String, required: true },
  reply: { type: String, required: true },
  suggestedCategory: { type: String, default: null },
  hadLocation: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export const VoiceLog = model<VoiceLogDocument>('VoiceLog', VoiceLogSchema);
