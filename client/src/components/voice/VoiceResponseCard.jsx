import { useTranslation } from 'react-i18next';

/**
 * Always renders the spoken guidance as text too — the assistant is an
 * accessibility feature, not a replacement for a readable answer.
 */
export default function VoiceResponseCard({ transcript, reply, suggestedCategory, onOpenMap }) {
  const { t } = useTranslation();
  if (!reply && !transcript) return null;

  return (
    <div className="card p-4 space-y-3">
      {transcript && (
        <p className="text-xs text-muted">
          <span className="font-semibold text-mist/70">{t('voice.youSaid')}</span> “{transcript}”
        </p>
      )}
      {reply && <p className="text-sm leading-relaxed text-mist">{reply}</p>}
      {suggestedCategory && (
        <button
          type="button"
          onClick={() => onOpenMap?.(suggestedCategory)}
          className="tap-target inline-flex items-center gap-2 rounded-full bg-calm/15 text-calm px-4 py-2 text-sm font-semibold"
        >
          {t('voice.showOnMap', { category: t(`categories.${suggestedCategory}`) })}
        </button>
      )}
    </div>
  );
}
