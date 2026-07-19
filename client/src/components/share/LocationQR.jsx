import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import QRCode from 'qrcode';
import { buildMapsLink } from '../../utils/deepLinks.js';
import { useAppStore } from '../../store/appStore.js';
import { useGeolocation } from '../../hooks/useGeolocation.js';

/**
 * "Share my location" — renders a QR code that encodes a Google Maps link to
 * the user's current position, so someone can scan it and track them. Also
 * offers the native share sheet where supported. Client-side only.
 */
export default function LocationQR() {
  const { t } = useTranslation();
  const coords = useAppStore((s) => s.coords);
  const { refresh } = useGeolocation();
  const [open, setOpen] = useState(false);
  const [dataUrl, setDataUrl] = useState('');

  const link = coords ? buildMapsLink(coords.lat, coords.lng) : '';
  const canShare = typeof navigator !== 'undefined' && !!navigator.share;

  useEffect(() => {
    if (!open || !link) {
      setDataUrl('');
      return undefined;
    }
    let cancelled = false;
    QRCode.toDataURL(link, {
      width: 240,
      margin: 1,
      color: { dark: '#0B1220', light: '#E7ECF3' },
    })
      .then((url) => {
        if (!cancelled) setDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setDataUrl('');
      });
    return () => {
      cancelled = true;
    };
  }, [open, link]);

  const handleOpen = () => {
    if (!coords) refresh(); // try to get a fix if we don't have one yet
    setOpen(true);
  };

  const handleShare = async () => {
    if (!canShare || !link) return;
    try {
      await navigator.share({ title: t('qr.title'), text: t('qr.shareText'), url: link });
    } catch {
      // user cancelled or share failed — non-fatal
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="tap-target mt-3 flex items-center justify-center gap-2 rounded-full bg-surface px-5 py-2.5 text-sm font-medium text-muted"
      >
        <QrIcon className="w-4 h-4" />
        {t('qr.button')}
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t('qr.title')}
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/90 p-6"
        >
          <div className="card w-full max-w-sm p-6 text-center">
            <p className="font-display text-xl font-semibold mb-4">{t('qr.title')}</p>

            {dataUrl ? (
              <img
                src={dataUrl}
                alt={t('qr.title')}
                className="mx-auto rounded-xl bg-mist p-2"
                width={240}
                height={240}
              />
            ) : (
              <p className="text-sm text-muted py-16">
                {coords ? t('qr.generating') : t('qr.noLocation')}
              </p>
            )}

            {link && <p className="mt-3 break-all text-xs text-muted">{link}</p>}

            <div className="mt-5 space-y-2">
              {canShare && link && (
                <button
                  type="button"
                  onClick={handleShare}
                  className="tap-target w-full rounded-full bg-calm text-ink py-3 font-semibold"
                >
                  {t('qr.share')}
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="tap-target w-full rounded-full bg-surface2 py-3 font-semibold"
              >
                {t('qr.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function QrIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <path d="M14 14h3v3M21 14v7h-7v-3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
