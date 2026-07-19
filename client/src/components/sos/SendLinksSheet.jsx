import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { buildSmsLink, buildWhatsAppLink } from '../../utils/deepLinks.js';

/**
 * Builds the ordered list of send links from saved contacts. SMS contacts are
 * merged into a single comma-recipient sms: link (one navigation, reliable);
 * each WhatsApp contact is its own wa.me link (wa.me takes one recipient).
 */
function buildLinks(contacts, message, t) {
  const links = [];
  const smsContacts = contacts.filter((c) => c.channel !== 'whatsapp');
  const waContacts = contacts.filter((c) => c.channel === 'whatsapp');

  if (smsContacts.length) {
    links.push({
      key: 'sms-all',
      channel: 'sms',
      label: t('sos.textContacts', { names: smsContacts.map((c) => c.name).join(', ') }),
      href: buildSmsLink(
        smsContacts.map((c) => c.phone),
        message
      ),
    });
  }
  for (const c of waContacts) {
    links.push({
      key: `wa-${c.id}`,
      channel: 'whatsapp',
      label: t('sos.whatsappContact', { name: c.name }),
      href: buildWhatsAppLink(c.phone, message),
    });
  }
  return links;
}

/**
 * Reusable modal that sends a message to the saved contacts via SMS/WhatsApp
 * deep links. Shared by the SOS alert and the "I'm Safe" follow-up.
 *
 * Timer/JS-driven popups are unreliable (blockers), so we best-effort auto-fire
 * the primary link once on mount and always render explicit tap-through buttons
 * for every contact as the dependable path. No server is involved.
 */
export default function SendLinksSheet({
  title,
  note,
  contacts,
  message,
  accentClass = 'bg-alert text-mist',
  ariaLabel,
  onClose,
}) {
  const { t } = useTranslation();
  const primaryRef = useRef(null);
  const links = buildLinks(contacts, message, t);

  useEffect(() => {
    if (links.length === 0) return;
    const primary = links[0];
    if (primary.channel === 'sms') {
      // sms: is a protocol navigation — fires even outside a user gesture.
      window.location.href = primary.href;
    } else {
      // wa.me is https; open via the rendered anchor (best-effort).
      primaryRef.current?.click();
    }
    // run once on mount; links are stable for this send
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-label={ariaLabel}
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/90 p-6"
    >
      <div className="card w-full max-w-sm p-6 text-center">
        <p className="font-display text-xl font-semibold mb-2">{title}</p>
        <p className="text-sm text-muted mb-5">{note}</p>

        <div className="space-y-2 mb-5">
          {links.map((link, i) => (
            <a
              key={link.key}
              ref={i === 0 ? primaryRef : null}
              href={link.href}
              target={link.channel === 'whatsapp' ? '_blank' : undefined}
              rel={link.channel === 'whatsapp' ? 'noreferrer' : undefined}
              className={`tap-target flex items-center justify-center w-full rounded-full py-3 font-semibold ${accentClass}`}
            >
              {link.label}
            </a>
          ))}
        </div>

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
