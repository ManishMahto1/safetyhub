/**
 * Resolves a country code from coordinates without any network call, so the
 * correct emergency numbers can be shown even offline. This trades precision
 * for reliability: a coarse bounding-box table, with the device timezone as
 * a secondary signal and the browser locale as a last resort.
 *
 * This is intentionally approximate. Contributions adding more countries to
 * REGION_BOXES are welcome — see CONTRIBUTING.md.
 */

// Rough bounding boxes: [minLat, maxLat, minLng, maxLng]
const REGION_BOXES = [
  { code: 'US', box: [24.5, 49.5, -125, -66.9] },
  { code: 'CA', box: [41.7, 83.1, -141, -52.6] },
  { code: 'GB', box: [49.9, 60.9, -8.6, 1.8] },
  { code: 'IN', box: [6.5, 35.5, 68, 97.4] },
  { code: 'AU', box: [-43.6, -10.7, 113.3, 153.6] },
  { code: 'JP', box: [24.4, 45.5, 122.9, 153.9] },
  { code: 'ZA', box: [-34.8, -22.1, 16.5, 32.9] },
  { code: 'BR', box: [-33.7, 5.3, -73.9, -34.8] },
  { code: 'EU', box: [35, 71, -10, 40] }, // coarse EU fallback
];

const TIMEZONE_COUNTRY = {
  'America/New_York': 'US',
  'America/Chicago': 'US',
  'America/Denver': 'US',
  'America/Los_Angeles': 'US',
  'America/Toronto': 'CA',
  'America/Vancouver': 'CA',
  'Europe/London': 'GB',
  'Asia/Kolkata': 'IN',
  'Asia/Calcutta': 'IN',
  'Australia/Sydney': 'AU',
  'Australia/Melbourne': 'AU',
  'Asia/Tokyo': 'JP',
  'Africa/Johannesburg': 'ZA',
  'America/Sao_Paulo': 'BR',
};

function fromCoords(lat, lng) {
  const hit = REGION_BOXES.find(
    ({ box }) => lat >= box[0] && lat <= box[1] && lng >= box[2] && lng <= box[3]
  );
  return hit?.code ?? null;
}

function fromTimezone() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return TIMEZONE_COUNTRY[tz] ?? null;
  } catch {
    return null;
  }
}

function fromLocale() {
  try {
    const locale = navigator.language || 'en-US';
    const region = new Intl.Locale(locale).region;
    return region ?? null;
  } catch {
    return null;
  }
}

/**
 * @param {{lat: number, lng: number} | null} coords
 * @returns {string} best-guess ISO country code, or 'default'
 */
export function detectRegion(coords) {
  if (coords && Number.isFinite(coords.lat) && Number.isFinite(coords.lng)) {
    const byCoords = fromCoords(coords.lat, coords.lng);
    if (byCoords) return byCoords;
  }
  return fromTimezone() || fromLocale() || 'default';
}
