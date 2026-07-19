/**
 * Resolves a country code from coordinates without any network call, so the
 * correct emergency numbers can be shown even offline. This trades precision
 * for reliability: a coarse bounding-box table, with the device timezone as
 * a secondary signal and the browser locale as a last resort.
 *
 * This is intentionally approximate. Contributions adding more countries to
 * REGION_BOXES are welcome — see CONTRIBUTING.md.
 */

// Rough bounding boxes: [minLat, maxLat, minLng, maxLng].
// Boxes overlap at borders; the FIRST match wins, so smaller / overlap-prone
// countries are listed before larger ones (CN, RU) and the coarse EU catch-all.
const REGION_BOXES = [
  // small / island / overlap-prone first
  { code: 'SG', box: [1.15, 1.48, 103.6, 104.1] },
  { code: 'LK', box: [5.9, 9.9, 79.6, 82.0] },
  { code: 'NP', box: [26.3, 30.5, 80.0, 88.3] },
  { code: 'BD', box: [20.6, 26.7, 88.0, 92.7] },
  { code: 'AE', box: [22.6, 26.1, 51.5, 56.4] },
  { code: 'CH', box: [45.8, 47.9, 5.9, 10.6] },
  { code: 'NL', box: [50.7, 53.6, 3.3, 7.3] },
  { code: 'KR', box: [33.0, 38.7, 125.9, 129.7] },
  // South Asia (before CN, which overlaps the north)
  { code: 'IN', box: [6.5, 35.5, 68, 97.4] },
  { code: 'PK', box: [23.6, 37.1, 60.9, 77.9] },
  // East / SE Asia
  { code: 'JP', box: [24.4, 45.5, 122.9, 153.9] },
  { code: 'TH', box: [5.5, 20.6, 97.3, 105.7] },
  { code: 'PH', box: [4.5, 21.2, 116.9, 126.7] },
  { code: 'MY', box: [0.8, 7.4, 99.6, 119.3] },
  { code: 'ID', box: [-11.1, 6.1, 95.0, 141.1] },
  // Europe
  { code: 'GB', box: [49.9, 60.9, -8.6, 1.8] },
  { code: 'IE', box: [51.4, 55.5, -10.6, -5.9] },
  { code: 'FR', box: [41.3, 51.1, -5.2, 9.6] },
  { code: 'DE', box: [47.2, 55.1, 5.8, 15.1] },
  { code: 'IT', box: [36.6, 47.1, 6.6, 18.6] },
  { code: 'ES', box: [36.0, 43.9, -9.4, 3.4] },
  { code: 'NO', box: [57.9, 71.3, 4.5, 31.2] },
  { code: 'SE', box: [55.3, 69.1, 11.0, 24.2] },
  { code: 'PL', box: [49.0, 54.9, 14.1, 24.2] },
  { code: 'TR', box: [35.8, 42.2, 25.6, 44.9] },
  // Americas
  { code: 'US', box: [24.5, 49.5, -125, -66.9] },
  { code: 'CA', box: [41.7, 83.1, -141, -52.6] },
  { code: 'MX', box: [14.5, 32.8, -118.5, -86.7] },
  { code: 'BR', box: [-33.7, 5.3, -73.9, -34.8] },
  { code: 'AR', box: [-55.1, -21.7, -73.6, -53.6] },
  // Oceania
  { code: 'AU', box: [-43.6, -10.7, 113.3, 153.6] },
  { code: 'NZ', box: [-47.3, -34.4, 166.4, 178.6] },
  // Africa / Middle East
  { code: 'EG', box: [22.0, 31.7, 24.7, 37.0] },
  { code: 'SA', box: [16.3, 32.2, 34.5, 55.7] },
  { code: 'NG', box: [4.2, 13.9, 2.6, 14.7] },
  { code: 'KE', box: [-4.7, 5.1, 33.9, 42.0] },
  { code: 'ZA', box: [-34.8, -22.1, 16.5, 32.9] },
  // large landmasses last so borders resolve to neighbours above
  { code: 'CN', box: [18.2, 53.6, 73.5, 134.8] },
  { code: 'RU', box: [41.2, 81.9, 19.6, 180] },
  { code: 'EU', box: [35, 71, -10, 40] }, // coarse EU fallback
];

const TIMEZONE_COUNTRY = {
  'America/New_York': 'US',
  'America/Chicago': 'US',
  'America/Denver': 'US',
  'America/Los_Angeles': 'US',
  'America/Phoenix': 'US',
  'America/Toronto': 'CA',
  'America/Vancouver': 'CA',
  'America/Mexico_City': 'MX',
  'America/Sao_Paulo': 'BR',
  'America/Argentina/Buenos_Aires': 'AR',
  'Europe/London': 'GB',
  'Europe/Dublin': 'IE',
  'Europe/Paris': 'FR',
  'Europe/Berlin': 'DE',
  'Europe/Rome': 'IT',
  'Europe/Madrid': 'ES',
  'Europe/Amsterdam': 'NL',
  'Europe/Zurich': 'CH',
  'Europe/Oslo': 'NO',
  'Europe/Stockholm': 'SE',
  'Europe/Warsaw': 'PL',
  'Europe/Moscow': 'RU',
  'Europe/Istanbul': 'TR',
  'Asia/Kolkata': 'IN',
  'Asia/Calcutta': 'IN',
  'Asia/Karachi': 'PK',
  'Asia/Dhaka': 'BD',
  'Asia/Kathmandu': 'NP',
  'Asia/Colombo': 'LK',
  'Asia/Shanghai': 'CN',
  'Asia/Tokyo': 'JP',
  'Asia/Seoul': 'KR',
  'Asia/Singapore': 'SG',
  'Asia/Kuala_Lumpur': 'MY',
  'Asia/Jakarta': 'ID',
  'Asia/Bangkok': 'TH',
  'Asia/Manila': 'PH',
  'Asia/Dubai': 'AE',
  'Asia/Riyadh': 'SA',
  'Africa/Cairo': 'EG',
  'Africa/Lagos': 'NG',
  'Africa/Nairobi': 'KE',
  'Africa/Johannesburg': 'ZA',
  'Australia/Sydney': 'AU',
  'Australia/Melbourne': 'AU',
  'Australia/Perth': 'AU',
  'Pacific/Auckland': 'NZ',
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
