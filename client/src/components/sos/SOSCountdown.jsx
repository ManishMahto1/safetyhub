import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import SendLinksSheet from './SendLinksSheet.jsx';
import { buildSosMessage } from '../../utils/deepLinks.js';
import { useAppStore } from '../../store/appStore.js';

const COUNTDOWN_SECONDS = 3;

/**
 * Shows a cancelable countdown, then hands off to SendLinksSheet to actually
 * open the SMS/WhatsApp deep links. The countdown window exists specifically
 * to prevent accidental triggers from an errant tap — see README "one-tap SOS
 * ... with a cancel window". No server is involved.
 */
export default function SOSCountdown({ coords, contacts, onClose }) {
  const { t } = useTranslation();
  const setSosActive = useAppStore((s) => s.setSosActive);
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);
  const [sent, setSent] = useState(false);
  const timerRef = useRef(null);

  const canSend = coords && contacts.length > 0;

  useEffect(() => {
    if (sent) return undefined;
    if (secondsLeft <= 0) {
      setSent(true);
      return undefined;
    }
    timerRef.current = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft, sent]);

  // Once we reach a real send, enable the "I'm Safe" follow-up on Home.
  useEffect(() => {
    if (sent && canSend) {
      setSosActive(true);
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]); // "alert sent" buzz
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sent]);

  // Countdown phase
  if (!sent) {
    return (
      <div
        role="alertdialog"
        aria-modal="true"
        aria-label={t('sos.sendingA11y')}
        className="fixed inset-0 z-50 flex items-center justify-center bg-ink/90 p-6"
      >
        <div className="card w-full max-w-sm p-6 text-center">
          <p className="text-sm text-muted mb-2">
            {t('sos.countdown', { count: contacts.length || 0 })}
          </p>
          <p className="font-display text-6xl font-bold text-alert mb-6" aria-live="assertive">
            {secondsLeft}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="tap-target w-full rounded-full bg-surface2 py-3 font-semibold"
          >
            {t('sos.cancel')}
          </button>
        </div>
      </div>
    );
  }

  // Happy path: send to contacts
  if (canSend) {
    const message = buildSosMessage({
      lat: coords.lat,
      lng: coords.lng,
      accuracy: coords.accuracy,
    });
    return (
      <SendLinksSheet
        ariaLabel={t('sos.sendingA11y')}
        title={t('sos.readyTitle')}
        note={t('sos.readyBody')}
        contacts={contacts}
        message={message}
        accentClass="bg-alert text-mist"
        onClose={onClose}
      />
    );
  }

  // Edge cases: nothing to send (no contacts or no location)
  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-label={t('sos.sendingA11y')}
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/90 p-6"
    >
      <div className="card w-full max-w-sm p-6 text-center">
        <p className="font-display text-xl font-semibold mb-2">
          {contacts.length === 0 ? t('sos.noContactsTitle') : t('sos.noLocationTitle')}
        </p>
        <p className="text-sm text-muted mb-6">
          {contacts.length === 0 ? t('sos.noContactsBody') : t('sos.noLocationBody')}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="tap-target w-full rounded-full bg-signal text-ink py-3 font-semibold"
        >
          {t('sos.done')}
        </button>
      </div>
    </div>
  );
}
