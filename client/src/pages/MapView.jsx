import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import MapContainer from '../components/map/MapContainer.jsx';
import CategoryFilterChips from '../components/map/CategoryFilterChips.jsx';
import PlaceDetailCard from '../components/map/PlaceDetailCard.jsx';
import PlaceList from '../components/map/PlaceList.jsx';
import CitySearch from '../components/map/CitySearch.jsx';
import { useGeolocation } from '../hooks/useGeolocation.js';
import { fetchNearbyPlaces } from '../services/placesService.js';
import { distanceInMeters, sortByDistance } from '../utils/distance.js';
import { saveLastPlaces, loadLastPlaces } from '../utils/placesCache.js';

export default function MapView() {
  const { t } = useTranslation();
  const { coords, error: geoError } = useGeolocation({ watch: true });
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get('category') || 'all';

  const [manualCoords, setManualCoords] = useState(null); // set via city search
  const [cachedOrigin, setCachedOrigin] = useState(null); // origin of offline-cached places
  const [view, setView] = useState('map'); // 'map' | 'list'
  const [places, setPlaces] = useState([]);
  const [source, setSource] = useState(null); // 'overpass' | 'fallback'
  const [usingCache, setUsingCache] = useState(false); // showing offline-persisted places
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | loading | error | ready

  // Live GPS wins; then a searched city; then the origin of cached offline data.
  const liveOrigin = coords || manualCoords;
  const origin = liveOrigin || cachedOrigin;

  useEffect(() => {
    if (!liveOrigin) return undefined;
    let cancelled = false;

    setStatus('loading');
    fetchNearbyPlaces({ lat: liveOrigin.lat, lng: liveOrigin.lng, category })
      .then(({ places: results, source: src }) => {
        if (cancelled) return;
        setPlaces(results);
        setSource(src);
        setUsingCache(false);
        setStatus('ready');
        saveLastPlaces({ origin: liveOrigin, category, places: results, source: src });
      })
      .catch(() => {
        if (cancelled) return;
        // Offline / server unreachable: fall back to the last places we saved.
        const cached = loadLastPlaces();
        if (cached?.places?.length) {
          setPlaces(cached.places);
          setSource(cached.source);
          setUsingCache(true);
          setStatus('ready');
        } else {
          setStatus('error');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [liveOrigin?.lat, liveOrigin?.lng, category]);

  // No live location yet (denied, or reopened offline): show last saved places
  // so the map isn't blank while we wait for — or never get — a GPS fix.
  useEffect(() => {
    if (liveOrigin) return;
    const cached = loadLastPlaces();
    if (cached?.places?.length) {
      setPlaces(cached.places);
      setSource(cached.source);
      setUsingCache(true);
      setCachedOrigin(cached.origin || null);
      setStatus('ready');
    }
  }, [liveOrigin]);

  const sortedPlaces = useMemo(() => sortByDistance(places, origin), [places, origin]);

  const locationDenied = !liveOrigin && !!geoError && places.length === 0;

  return (
    <div className="fixed inset-0 flex flex-col pb-16">
      {/* toolbar: city search + view toggle */}
      <div className="flex items-center gap-2 px-4 pt-3">
        <CitySearch onSelect={setManualCoords} />
        <ViewToggle view={view} onChange={setView} t={t} />
      </div>

      <CategoryFilterChips
        active={category}
        onChange={(next) => setSearchParams(next === 'all' ? {} : { category: next })}
      />

      <div className="relative min-h-0 flex-1">
        {locationDenied ? (
          <div className="flex h-full items-center justify-center px-6 text-center text-sm text-muted">
            {t('map.locationOff')}
          </div>
        ) : !origin ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center text-sm text-muted">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-calm/30 border-t-calm" />
            {t('map.locating')}
          </div>
        ) : view === 'map' ? (
          <MapContainer coords={origin} places={sortedPlaces} onSelectPlace={setSelected} />
        ) : (
          <PlaceList places={sortedPlaces} origin={origin} onSelect={setSelected} />
        )}

        {/* status pills */}
        {status === 'loading' && <Pill className="text-muted">{t('map.loading')}</Pill>}
        {status === 'ready' && usingCache && (
          <Pill className="text-signal">{t('map.offlineCached')}</Pill>
        )}
        {status === 'ready' && !usingCache && source === 'fallback' && (
          <Pill className="text-signal">{t('map.sampleData')}</Pill>
        )}
        {status === 'error' && <Pill className="text-alert">{t('map.loadError')}</Pill>}

        {view === 'map' && (
          <PlaceDetailCard
            place={selected}
            distanceMeters={
              selected && origin
                ? distanceInMeters(origin.lat, origin.lng, selected.lat, selected.lng)
                : undefined
            }
            onClose={() => setSelected(null)}
          />
        )}
      </div>
    </div>
  );
}

function ViewToggle({ view, onChange, t }) {
  return (
    <div
      className="flex shrink-0 rounded-full bg-surface p-0.5 text-xs font-semibold"
      role="tablist"
      aria-label={t('map.viewToggleAria')}
    >
      {['map', 'list'].map((v) => (
        <button
          key={v}
          type="button"
          role="tab"
          aria-selected={view === v}
          onClick={() => onChange(v)}
          className={`rounded-full px-3 py-1.5 transition-colors ${
            view === v ? 'bg-signal text-ink' : 'text-muted'
          }`}
        >
          {v === 'map' ? t('map.viewMap') : t('map.viewList')}
        </button>
      ))}
    </div>
  );
}

function Pill({ className = '', children }) {
  return (
    <div
      className={`absolute top-3 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap rounded-full bg-surface px-4 py-1.5 text-xs shadow-card ${className}`}
    >
      {children}
    </div>
  );
}
