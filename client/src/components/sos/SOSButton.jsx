import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import SOSCountdown from './SOSCountdown.jsx';
import { useGeolocation } from '../../hooks/useGeolocation.js';
import { useEmergencyContacts } from '../../hooks/useEmergencyContacts.js';

/**
 * The app's signature element: a beacon that "pings" outward, echoing the
 * idea of sending a signal for help. Tapping it doesn't fire immediately —
 * it opens SOSCountdown, which is the actual point of no accidental return.
 */
export default function SOSButton() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const { coords, refresh } = useGeolocation();
  const { contacts } = useEmergencyContacts();

  const handlePress = () => {
    if (navigator.vibrate) navigator.vibrate(60); // tactile confirmation of the press
    refresh(); // grab the freshest fix right as intent is expressed
    setOpen(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={handlePress}
        className="tap-target relative flex items-center justify-center w-36 h-36 rounded-full bg-alert text-mist font-display font-bold text-2xl shadow-card active:scale-95 transition-transform"
        aria-label={t('sos.aria')}
      >
        <span className="absolute inset-0 rounded-full bg-alert/60 animate-ping-slow" />
        <span className="absolute inset-0 rounded-full bg-alert/40 animate-ping-slow [animation-delay:0.6s]" />
        <span className="relative">{t('sos.button')}</span>
      </button>

      {contacts.length === 0 && (
        <p className="mt-3 text-xs text-muted text-center max-w-[220px]">
          {t('sos.noContactsHint')}
        </p>
      )}

      {open && (
        <SOSCountdown coords={coords} contacts={contacts} onClose={() => setOpen(false)} />
      )}
    </>
  );
}
