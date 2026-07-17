const CATEGORY_LABEL = {
  hospital: 'Hospitals nearby',
  pharmacy: 'Pharmacies nearby',
  police: 'Police nearby',
  bank: 'Banks nearby',
  fuel: 'Fuel stations nearby',
  'fire-station': 'Fire stations nearby',
};

/**
 * Always renders the spoken guidance as text too — the assistant is an
 * accessibility feature, not a replacement for a readable answer.
 */
export default function VoiceResponseCard({ transcript, reply, suggestedCategory, onOpenMap }) {
  if (!reply && !transcript) return null;

  return (
    <div className="card p-4 space-y-3">
      {transcript && (
        <p className="text-xs text-muted">
          <span className="font-semibold text-mist/70">You said:</span> “{transcript}”
        </p>
      )}
      {reply && (
        <p className="text-sm leading-relaxed text-mist">{reply}</p>
      )}
      {suggestedCategory && CATEGORY_LABEL[suggestedCategory] && (
        <button
          type="button"
          onClick={() => onOpenMap?.(suggestedCategory)}
          className="tap-target inline-flex items-center gap-2 rounded-full bg-calm/15 text-calm px-4 py-2 text-sm font-semibold"
        >
          Show {CATEGORY_LABEL[suggestedCategory].toLowerCase()} on map
        </button>
      )}
    </div>
  );
}
