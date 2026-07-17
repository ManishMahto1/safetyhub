import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import MapContainer from '../components/map/MapContainer.jsx';
import CategoryFilterChips from '../components/map/CategoryFilterChips.jsx';
import PlaceDetailCard from '../components/map/PlaceDetailCard.jsx';
import { useGeolocation } from '../hooks/useGeolocation.js';
import { fetchNearbyPlaces } from '../services/placesService.js';
import { distanceInMeters } from '../utils/distance.js';

export default function MapView() {
  const { coords } = useGeolocation({ watch: true });
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get('category') || 'all';

  const [places, setPlaces] = useState([]);
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | loading | error | ready

  useEffect(() => {
    if (!coords) return;
    let cancelled = false;

    setStatus('loading');
    fetchNearbyPlaces({ lat: coords.lat, lng: coords.lng, category })
      .then((results) => {
        if (cancelled) return;
        setPlaces(results);
        setStatus('ready');
      })
      .catch(() => {
        if (cancelled) return;
        setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [coords?.lat, coords?.lng, category]);

  return (
    <div className="fixed inset-0 pb-16">
      <CategoryFilterChips
        active={category}
        onChange={(next) => setSearchParams(next === 'all' ? {} : { category: next })}
      />

      <div className="relative h-[calc(100%-56px)]">
        <MapContainer coords={coords} places={places} onSelectPlace={setSelected} />

        {status === 'loading' && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-surface px-4 py-1.5 rounded-full text-xs text-muted shadow-card">
            Finding nearby places…
          </div>
        )}
        {status === 'error' && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-surface px-4 py-1.5 rounded-full text-xs text-alert shadow-card">
            Couldn't load places — showing your last-loaded map data if available
          </div>
        )}

        <PlaceDetailCard
          place={selected}
          distanceMeters={
            selected && coords
              ? distanceInMeters(coords.lat, coords.lng, selected.lat, selected.lng)
              : undefined
          }
          onClose={() => setSelected(null)}
        />
      </div>
    </div>
  );
}
