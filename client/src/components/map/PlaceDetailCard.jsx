import { useTranslation } from 'react-i18next';
import PlacePhoto from './PlacePhoto.jsx';
import { formatDistance } from '../../utils/distance.js';
import { buildTelLink, buildMapsLink } from '../../utils/deepLinks.js';

export default function PlaceDetailCard({ place, distanceMeters, onClose }) {
  const { t } = useTranslation();
  if (!place) return null;

  return (
    <div className="fixed inset-x-0 bottom-16 z-30 p-3">
      <div className="card p-3 flex gap-3 items-start max-w-lg mx-auto">
        <PlacePhoto
          photoUrl={place.photoUrl}
          category={place.category}
          name={place.name}
          className="w-20 h-20 rounded-xl shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold leading-snug truncate">{place.name}</h3>
            <button
              type="button"
              onClick={onClose}
              aria-label={t('map.closeDetails')}
              className="tap-target shrink-0 text-muted"
            >
              ✕
            </button>
          </div>
          {place.address && <p className="text-xs text-muted mt-0.5 truncate">{place.address}</p>}
          {Number.isFinite(distanceMeters) && (
            <p className="text-xs text-calm mt-0.5">
              {t('map.away', { distance: formatDistance(distanceMeters) })}
            </p>
          )}
          <div className="flex gap-2 mt-3">
            {place.phone && (
              <a
                href={buildTelLink(place.phone)}
                className="tap-target flex items-center justify-center flex-1 rounded-full bg-signal text-ink text-sm font-semibold px-3 py-2"
              >
                {t('map.call')}
              </a>
            )}
            <a
              href={buildMapsLink(place.lat, place.lng)}
              target="_blank"
              rel="noreferrer"
              className="tap-target flex items-center justify-center flex-1 rounded-full bg-surface2 text-sm font-semibold px-3 py-2"
            >
              {t('map.directions')}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
