/**
 * Haversine distance between two lat/lng points, in meters.
 */
export function distanceInMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth radius in meters
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/** Human-friendly distance label: meters under 1km, otherwise km with 1 decimal. */
export function formatDistance(meters) {
  if (!Number.isFinite(meters)) return '';
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

/** Sorts an array of places (each with lat/lng) by distance from an origin. */
export function sortByDistance(places, origin) {
  if (!origin) return places;
  return [...places].sort(
    (a, b) =>
      distanceInMeters(origin.lat, origin.lng, a.lat, a.lng) -
      distanceInMeters(origin.lat, origin.lng, b.lat, b.lng)
  );
}
