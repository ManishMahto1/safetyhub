import { useEffect, useRef, useState } from 'react';
import { buildSmsLink, buildWhatsAppLink, buildSosMessage } from '../../utils/deepLinks.js';

const COUNTDOWN_SECONDS = 5;

/**
 * Shows a cancelable countdown before actually opening the SMS/WhatsApp
 * deep links. This window exists specifically to prevent accidental triggers
 * from an errant tap — see README "one-tap SOS ... with a cancel window".
 */
export default function SOSCountdown({ coords, contacts, onClose }) {
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);
  const [sent, setSent] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (sent) return undefined;

    if (secondsLeft <= 0) {
      sendAlert();
      return undefined;
    }

    timerRef.current = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft, sent]);

  function sendAlert() {
    setSent(true);
    if (!coords || contacts.length === 0) return;

    const message = buildSosMessage({
      lat: coords.lat,
      lng: coords.lng,
      accuracy: coords.accuracy,
    });

    // Open one deep link per contact. Browsers may block more than one
    // popup — the primary contact's link is prioritized first.
    contacts.forEach((contact, index) => {
      const link = contact.channel === 'whatsapp'
        ? buildWhatsAppLink(contact.phone, message)
        : buildSmsLink(contact.phone, message);
      setTimeout(() => window.open(link, '_blank'), index * 400);
    });
  }

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-label="Sending SOS"
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/90 p-6"
    >
      <div className="card w-full max-w-sm p-6 text-center">
        {!sent ? (
          <>
            <p className="text-sm text-muted mb-2">Sending your location to {contacts.length || 0} contact(s) in</p>
            <p className="font-display text-6xl font-bold text-alert mb-6" aria-live="assertive">
              {secondsLeft}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="tap-target w-full rounded-full bg-surface2 py-3 font-semibold"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <p className="font-display text-xl font-semibold mb-2">
              {contacts.length === 0
                ? 'No contacts saved'
                : coords
                ? 'Alert sent'
                : "Couldn't get your location"}
            </p>
            <p className="text-sm text-muted mb-6">
              {contacts.length === 0
                ? 'Add an emergency contact first so SOS has somewhere to send your location.'
                : coords
                ? 'Your message app should have opened for each contact. Send it if it didn\'t send automatically.'
                : 'Check location permissions and try again.'}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="tap-target w-full rounded-full bg-signal text-ink py-3 font-semibold"
            >
              Done
            </button>
          </>
        )}
      </div>
    </div>
  );
}
