import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSpeechRecognition } from './useSpeechRecognition.js';
import { useSpeechSynthesis } from './useSpeechSynthesis.js';
import VoiceResponseCard from './VoiceResponseCard.jsx';
import { requestVoiceGuidance } from '../../services/voiceAssistService.js';
import { localVoiceGuidance } from '../../utils/voiceFallback.js';
import { activeBcp47, activeLanguageName } from '../../i18n/index.js';
import { useAppStore } from '../../store/appStore.js';

export default function VoiceAssistant() {
  const { t } = useTranslation();
  const bcp47 = activeBcp47();
  const {
    transcript,
    listening,
    start,
    stop,
    error: sttError,
    isSupported: sttSupported,
  } = useSpeechRecognition({ lang: bcp47 });
  const { speak, speaking, isSupported: ttsSupported } = useSpeechSynthesis();
  const coords = useAppStore((s) => s.coords);
  const navigate = useNavigate();

  const [reply, setReply] = useState('');
  const [suggestedCategory, setSuggestedCategory] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | listening | thinking | speaking | error
  const [micError, setMicError] = useState('');
  const submittedRef = useRef(false); // guards against submitting the same utterance twice

  const handleMicPress = () => {
    if (listening) {
      stop();
      return;
    }
    setReply('');
    setSuggestedCategory(null);
    setMicError('');
    setStatus('listening');
    start();
  };

  // Surface speech-recognition errors instead of silently returning to idle —
  // otherwise a blocked mic permission just looks like "nothing happened".
  useEffect(() => {
    if (!sttError || sttError === 'aborted') return;
    const keyByError = {
      'not-allowed': 'voice.errDenied',
      'service-not-allowed': 'voice.errDenied',
      'audio-capture': 'voice.errNoMic',
      'no-speech': 'voice.errNoSpeech',
      network: 'voice.errNetwork',
    };
    setMicError(t(keyByError[sttError] || 'voice.statusError'));
    setStatus('idle');
  }, [sttError, t]);

  async function submitTranscript(text) {
    setStatus('thinking');
    try {
      const result = await requestVoiceGuidance({
        transcript: text,
        coords,
        language: activeLanguageName(),
      });
      setReply(result.reply);
      setSuggestedCategory(result.suggestedCategory);
      setStatus('speaking');
      speak(result.reply, bcp47);
    } catch {
      // Server unreachable (offline) or errored — degrade to on-device keyword
      // guidance so we still highlight a category and speak something useful.
      const local = localVoiceGuidance(text);
      setReply(local.reply);
      setSuggestedCategory(local.suggestedCategory);
      setStatus('speaking');
      speak(local.reply, bcp47);
    }
  }

  // When recognition ends (listening -> false) after a listening session,
  // submit the final transcript exactly once. Done in an effect (not during
  // render) so we don't fire the request repeatedly.
  useEffect(() => {
    if (listening) {
      submittedRef.current = false;
      return;
    }
    if (status !== 'listening' || submittedRef.current) return;
    if (transcript.trim()) {
      submittedRef.current = true;
      submitTranscript(transcript.trim());
    } else {
      setStatus('idle');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listening, transcript, status]);

  if (!sttSupported) {
    return <div className="card p-4 text-sm text-muted">{t('voice.unsupported')}</div>;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={handleMicPress}
          aria-pressed={listening}
          aria-label={listening ? t('voice.micStop') : t('voice.micStart')}
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
            {status === 'listening' && t('voice.statusListening')}
            {status === 'thinking' && t('voice.statusThinking')}
            {status === 'speaking' &&
              (speaking && ttsSupported ? t('voice.statusSpeaking') : t('voice.statusSpeakingDone'))}
            {status === 'idle' && t('voice.statusIdle')}
            {status === 'error' && t('voice.statusError')}
          </p>
          <p className="text-muted text-xs">{t('voice.disclaimer')}</p>
        </div>
      </div>

      {micError && <p className="text-alert text-xs">{micError}</p>}

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
