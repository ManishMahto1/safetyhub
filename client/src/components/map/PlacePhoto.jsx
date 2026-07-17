import { useState } from 'react';

const FALLBACK_ICON = {
  hospital: '/category-icons/hospital.svg',
  pharmacy: '/category-icons/pharmacy.svg',
  police: '/category-icons/police.svg',
  bank: '/category-icons/bank.svg',
  fuel: '/category-icons/fuel.svg',
  'fire-station': '/category-icons/fire-station.svg',
};

/**
 * Tries the real photo (from Overpass/Wikimedia tags via the backend);
 * falls back to the category icon if there's no photo or it fails to load.
 */
export default function PlacePhoto({ photoUrl, category, name, className = '' }) {
  const [failed, setFailed] = useState(false);
  const showFallback = !photoUrl || failed;
  const src = showFallback ? FALLBACK_ICON[category] || FALLBACK_ICON.hospital : photoUrl;

  return (
    <img
      src={src}
      alt={showFallback ? '' : name}
      onError={() => setFailed(true)}
      className={`object-cover bg-surface2 ${showFallback ? 'p-3' : ''} ${className}`}
      loading="lazy"
    />
  );
}
