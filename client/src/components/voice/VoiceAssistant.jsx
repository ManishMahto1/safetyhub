import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSpeechRecognition } from './useSpeechRecognition.js';
import { useSpeechSynthesis } from './useSpeechSynthesis.js';
import VoiceResponseCard from './VoiceResponseCard.jsx';
import { requestVoiceGuidance } from '../../services/voiceAssistService.js';
import { useAppStore } from '../../store/appStore.js';

export default function VoiceAssistant() {
  const { transcript, listening, start, stop, isSupported: sttSupported } = useSpeechRecognition();
  const { speak, speaking, isSupported: ttsSupported } = useSpeechSynthesis();
  const coords = useAppStore((s) => s.coords);
  const navigate = useNavigate();

  const [reply, setReply] = useState('');
  const [suggestedCategory, setSuggestedCategory] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | listening | thinking | speaking | error

  const handleMicPress = async () => {
    if (listening) {
      stop();
      return;
    }
    setReply('');
    setSuggestedCategory(null);
    setStatus('listening');
    start();
  };

  // When recognition stops (listening -> false) and we have a transcript, ask the backend
  const handleRecognitionEnd = async () => {
    if (!transcript.trim()) {
      setStatus('idle');
      return;
    }
    setStatus('thinking');
    try {
      const result = await requestVoiceGuidance({ transcript, coords });
      setReply(result.reply);
      setSuggestedCategory(result.suggestedCategory);
      setStatus('speaking');
      speak(result.reply);
    } catch (err) {
      const message = err?.offline
        ? "I can't reach the assistant while offline — check the map or emergency numbers directly."
        : "Something went wrong reaching the assistant. Please try again.";
      setReply(message);
      setStatus('error');
      speak(message);
    }
  };

  // fire handleRecognitionEnd right after `listening` flips to false with content
  if (!listening && status === 'listening' && transcript) {
    handleRecognitionEnd();
  }

  if (!sttSupported) {
    return (
      <div className="card p-4 text-sm text-muted">
        Voice input isn't supported in this browser. Try Chrome or Safari, or use the map and
        emergency numbers directly.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={handleMicPress}
          aria-pressed={listening}
          aria-label={listening ? 'Stop listening' : 'Speak to the voice assistant'}
          className={`tap-target relative flex items-center justify-center w-16 h-16 rounded-full font-semibold transition-colors ${
            listening ? 'bg-calm text-ink' : 'bg-surface text-calm border border-calm/40'
          }`}
        >
          {listening && (
            <span className="absolute inset-0 rounded-full bg-calm/40 animate-ping-slow" />
          )}
          <MicIcon className="w-7 h-7 relative" />
        </button>
        <div className="text-sm">
          <p className="font-semibold">
            {status === 'listening' && "Listening…"}
            {status === 'thinking' && 'Thinking…'}
            {status === 'speaking' && (speaking && ttsSupported ? 'Speaking guidance…' : 'Here\'s what to do')}
            {status === 'idle' && 'Tap the mic and describe what\'s happening'}
            {status === 'error' && 'Couldn\'t get guidance'}
          </p>
          <p className="text-muted text-xs">Guidance only — SOS is never triggered automatically.</p>
        </div>
      </div>

      <VoiceResponseCard
        transcript={transcript}
        reply={reply}
        suggestedCategory={suggestedCategory}
        onOpenMap={(category) => navigate(`/map?category=${category}`)}
      />
    </div>
  );
}

function MicIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3" strokeLinecap="round" />
    </svg>
  );
}
