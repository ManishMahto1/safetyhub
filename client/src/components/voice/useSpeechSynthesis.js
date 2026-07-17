import { useCallback, useEffect, useState } from 'react';

const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;

/**
 * Speaks calm, spoken guidance aloud. Deliberately simple — one utterance
 * at a time, cancels any prior speech before starting a new one so guidance
 * never overlaps or queues awkwardly.
 */
export function useSpeechSynthesis() {
  const [speaking, setSpeaking] = useState(false);
  const isSupported = Boolean(synth);

  useEffect(() => () => synth?.cancel(), []);

  const speak = useCallback(
    (text) => {
      if (!isSupported || !text) return;
      synth.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95; // slightly slower than default — calmer, clearer in a crisis
      utterance.pitch = 1;
      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);
      synth.speak(utterance);
    },
    [isSupported]
  );

  const stop = useCallback(() => {
    synth?.cancel();
    setSpeaking(false);
  }, []);

  return { speak, stop, speaking, isSupported };
}
