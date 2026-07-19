import { useTranslation } from 'react-i18next';
import PlacePhoto from './PlacePhoto.jsx';
import { formatDistance, distanceInMeters } from '../../utils/distance.js';
import { buildTelLink, buildMapsLink } from '../../utils/deepLinks.js';

/**
 * List view of nearby places. Expects `places` already sorted by distance.
 * Tapping a row selects it (so the map view stays in sync); Call/Directions
 * are direct deep links.
 */
export default function PlaceList({ places, origin, onSelect }) {
  const { t } = useTranslation();

  if (!places.length) {
    return (
      <div className="flex h-full items-center justify-center px-6 text-center text-sm text-muted">
        {t('map.emptyList')}
      </div>
    );
  }

  return (
    <ul className="h-full overflow-y-auto px-3 py-3 space-y-2 max-w-lg mx-auto">
      {places.map((place) => {
        const meters = origin
          ? distanceInMeters(origin.lat, origin.lng, place.lat, place.lng)
          : undefined;
        return (
          <li key={place.id}>
            <div className="card flex items-start gap-3 p-3">
              <button
                type="button"
                onClick={() => onSelect(place)}
                className="flex flex-1 min-w-0 items-start gap-3 text-left"
                aria-label={t('map.showOnMapAria', { name: place.name })}
              >
                <PlacePhoto
                  photoUrl={place.photoUrl}
                  category={place.category}
                  name={place.name}
                  className="h-16 w-16 rounded-xl shrink-0"
                />
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold truncate">{place.name}</span>
                  <span className="block text-xs text-muted">
                    {t(`categoryName.${place.category}`)}
                  </span>
                  {Number.isFinite(meters) && (
                    <span className="block text-xs text-calm mt-0.5">
                      {t('map.away', { distance: formatDistance(meters) })}
                    </span>
                  )}
                </span>
              </button>
              <div className="flex shrink-0 flex-col gap-2">
                {place.phone && (
                  <a
                    href={buildTelLink(place.phone)}
                    aria-label={t('map.callAria', { name: place.name })}
                    className="tap-target flex items-center justify-center rounded-full bg-signal px-3 text-xs font-semibold text-ink"
                  >
                    {t('map.call')}
                  </a>
                )}
                <a
                  href={buildMapsLink(place.lat, place.lng)}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={t('map.directionsAria', { name: place.name })}
                  className="tap-target flex items-center justify-center rounded-full bg-surface2 px-3 text-xs font-semibold"
                >
                  {t('map.directions')}
                </a>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
