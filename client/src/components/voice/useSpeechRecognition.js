import { useCallback, useEffect, useRef, useState } from 'react';

const SpeechRecognitionImpl =
  typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);

/**
 * Thin wrapper around the browser's SpeechRecognition API.
 * Returns interim + final transcript text and listening state.
 */
export function useSpeechRecognition() {
  const [transcript, setTranscript] = useState('');
  const [listening, setListening] = useState(false);
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);

  const isSupported = Boolean(SpeechRecognitionImpl);

  useEffect(() => {
    if (!isSupported) return undefined;

    const recognition = new SpeechRecognitionImpl();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = navigator.language || 'en-US';

    recognition.onresult = (event) => {
      let text = '';
      for (let i = 0; i < event.results.length; i += 1) {
        text += event.results[i][0].transcript;
      }
      setTranscript(text);
    };

    recognition.onerror = (event) => {
      setError(event.error);
      setListening(false);
    };

    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;

    return () => recognition.stop();
  }, [isSupported]);

  const start = useCallback(() => {
    if (!recognitionRef.current) return;
    setTranscript('');
    setError(null);
    setListening(true);
    try {
      recognitionRef.current.start();
    } catch {
      // start() throws if already started — safe to ignore
    }
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  return { transcript, listening, error, start, stop, isSupported };
}
