import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import shelters from '../../data/disasterShelters.json';
import { useAppStore } from '../../store/appStore.js';
import { sortByDistance, distanceInMeters, formatDistance } from '../../utils/distance.js';
import { buildTelLink, buildMapsLink } from '../../utils/deepLinks.js';

const TYPE_COLOR = {
  shelter: 'text-info',
  relief: 'text-signal',
  medical: 'text-calm',
  food: 'text-mist',
};

/**
 * Home section listing curated shelters / relief centers. Rendered only while
 * disaster mode is active. Data is a bundled static dataset, so it works fully
 * offline (this is the whole point in a disaster). Sorted by distance when a
 * location is known.
 */
export default function DisasterShelters() {
  const { t } = useTranslation();
  const disasterMode = useAppStore((s) => s.disasterMode);
  const coords = useAppStore((s) => s.coords);

  const sorted = useMemo(() => sortByDistance(shelters, coords), [coords]);

  if (!disasterMode) return null;

  return (
    <section aria-labelledby="disaster-heading" className="space-y-3">
      <div>
        <h2 id="disaster-heading" className="font-display font-semibold text-lg text-alert">
          {t('disaster.sheltersTitle')}
        </h2>
        <p className="text-xs text-muted mt-0.5">{t('disaster.sheltersSubtitle')}</p>
      </div>

      {sorted.length === 0 ? (
        <p className="card px-4 py-6 text-center text-sm text-muted">{t('disaster.empty')}</p>
      ) : (
        <ul className="space-y-2">
          {sorted.map((s) => {
            const meters = coords
              ? distanceInMeters(coords.lat, coords.lng, s.lat, s.lng)
              : undefined;
            return (
              <li key={s.id} className="card p-3 flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold truncate">{s.name}</p>
                  <p className={`text-xs font-medium ${TYPE_COLOR[s.type] || 'text-muted'}`}>
                    {t(`disasterType.${s.type}`)}
                    {s.capacity ? ` · ${s.capacity}` : ''}
                  </p>
                  {s.address && <p className="text-xs text-muted truncate">{s.address}</p>}
                  {Number.isFinite(meters) && (
                    <p className="text-xs text-calm mt-0.5">
                      {t('map.away', { distance: formatDistance(meters) })}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 flex-col gap-2">
                  {s.phone && (
                    <a
                      href={buildTelLink(s.phone)}
                      aria-label={t('map.callAria', { name: s.name })}
                      className="tap-target flex items-center justify-center rounded-full bg-signal px-3 text-xs font-semibold text-ink"
                    >
                      {t('map.call')}
                    </a>
                  )}
                  <a
                    href={buildMapsLink(s.lat, s.lng)}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={t('map.directionsAria', { name: s.name })}
                    className="tap-target flex items-center justify-center rounded-full bg-surface2 px-3 text-xs font-semibold"
                  >
                    {t('map.directions')}
                  </a>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
