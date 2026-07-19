/**
 * Persists the last successfully-fetched places to localStorage so the map
 * isn't blank when the app is reopened offline. The Workbox runtime cache also
 * caches /api/places responses, but only for an exact request URL — GPS jitter
 * changes the coordinates and misses that cache, so we keep an app-level copy
 * of the most recent result keyed to nothing but "last".
 */
const KEY = 'safetyhub:lastPlaces';

export function saveLastPlaces({ origin, category, places, source }) {
  if (!places || places.length === 0) return;
  try {
    localStorage.setItem(
      KEY,
      JSON.stringify({ origin, category, places, source, savedAt: Date.now() })
    );
  } catch {
    // storage unavailable (private mode / quota) — non-fatal, offline map just
    // won't persist across reloads
  }
}

/** @returns {{ origin, category, places, source, savedAt } | null} */
export function loadLastPlaces() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
