import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import SendLinksSheet from './SendLinksSheet.jsx';
import { buildSafeMessage } from '../../utils/deepLinks.js';
import { useAppStore } from '../../store/appStore.js';
import { useEmergencyContacts } from '../../hooks/useEmergencyContacts.js';

/**
 * Appears on Home only after an SOS was sent (sosActive). Sends a follow-up
 * "I'm safe now" message to the same contacts to close the emergency loop,
 * then clears the flag. Serverless — reuses the SOS send path.
 */
export default function ImSafeButton() {
  const { t } = useTranslation();
  const sosActive = useAppStore((s) => s.sosActive);
  const setSosActive = useAppStore((s) => s.setSosActive);
  const coords = useAppStore((s) => s.coords);
  const { contacts } = useEmergencyContacts();
  const [open, setOpen] = useState(false);

  if (!sosActive) return null;

  const message = buildSafeMessage(coords ? { lat: coords.lat, lng: coords.lng } : {});

  const handleClick = () => {
    if (contacts.length) setOpen(true);
    else setSosActive(false); // nothing to send — just dismiss
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className="tap-target mt-4 flex items-center justify-center gap-2 rounded-full bg-calm/15 text-calm border border-calm/40 px-5 py-2.5 text-sm font-semibold"
      >
        <CheckIcon className="w-4 h-4" />
        {t('imSafe.button')}
      </button>

      {open && (
        <SendLinksSheet
          ariaLabel={t('imSafe.button')}
          title={t('imSafe.sheetTitle')}
          note={t('imSafe.sheetBody')}
          contacts={contacts}
          message={message}
          accentClass="bg-calm text-ink"
          onClose={() => {
            setOpen(false);
            setSosActive(false);
          }}
        />
      )}
    </>
  );
}

function CheckIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" {...props}>
      <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
