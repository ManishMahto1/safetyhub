import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { searchCity } from '../../services/geocodeService.js';

/**
 * Search-by-city control. Debounces input, queries the server geocode proxy,
 * and calls onSelect({ lat, lng, label }) when a result is picked. This is the
 * recovery path when the browser Geolocation permission is denied.
 */
export default function CitySearch({ onSelect }) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  // debounce the query -> geocode lookup
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      return undefined;
    }
    setLoading(true);
    const id = setTimeout(() => {
      let cancelled = false;
      searchCity(q)
        .then((rows) => {
          if (!cancelled) {
            setResults(rows);
            setOpen(true);
          }
        })
        .catch(() => {
          if (!cancelled) setResults([]);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
      return () => {
        cancelled = true;
      };
    }, 400);
    return () => clearTimeout(id);
  }, [query]);

  // close the dropdown on outside click
  useEffect(() => {
    const onDocClick = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  function pick(row) {
    onSelect({ lat: row.lat, lng: row.lng, label: row.name });
    setQuery(shortLabel(row.name));
    setOpen(false);
  }

  return (
    <div ref={boxRef} className="relative flex-1 min-w-0">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results.length && setOpen(true)}
        placeholder={t('map.searchPlaceholder')}
        aria-label={t('map.searchAria')}
        className="w-full rounded-full bg-surface px-4 py-2 text-sm placeholder:text-muted"
      />
      {loading && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted">…</span>
      )}
      {open && results.length > 0 && (
        <ul className="absolute z-40 mt-1 max-h-64 w-full overflow-y-auto rounded-xl bg-surface shadow-card">
          {results.map((row, i) => (
            <li key={`${row.lat},${row.lng},${i}`}>
              <button
                type="button"
                onClick={() => pick(row)}
                className="tap-target block w-full px-4 py-2 text-left text-sm hover:bg-surface2"
              >
                {shortLabel(row.name)}
                <span className="block truncate text-xs text-muted">{row.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Nominatim display names are long; show the first 2 parts as the headline. */
function shortLabel(name) {
  return name.split(',').slice(0, 2).join(',').trim();
}
