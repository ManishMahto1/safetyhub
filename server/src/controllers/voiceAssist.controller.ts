import { Request, Response } from 'express';
import { getVoiceGuidance } from '../services/openai.service';
import { VoiceLog } from '../models/VoiceLog.model';
import { VoiceAssistRequestBody } from '../types/voiceAssist.types';

export async function postVoiceAssist(req: Request, res: Response): Promise<void> {
  const { transcript, location, language } = req.body as VoiceAssistRequestBody;

  if (!transcript || !transcript.trim()) {
    res.status(400).json({ message: 'transcript is required' });
    return;
  }

  const result = await getVoiceGuidance(transcript.trim(), location, language);

  res.json({ reply: result.reply, suggestedCategory: result.suggestedCategory });

  // Fire-and-forget demo logging — never blocks or affects the response,
  // and silently no-ops if Mongo isn't connected.
  VoiceLog.create({
    transcript: transcript.trim(),
    reply: result.reply,
    suggestedCategory: result.suggestedCategory,
    hadLocation: Boolean(location),
  }).catch(() => {
    /* logging is best-effort only */
  });
}
