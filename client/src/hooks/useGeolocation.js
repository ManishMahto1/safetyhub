import { useCallback, useEffect, useState } from 'react';
import { useAppStore } from '../store/appStore.js';

/**
 * Wraps the browser Geolocation API. Exposes a manual `refresh()` (used by
 * the SOS button so location is as fresh as possible right before sending)
 * plus an optional `watch` mode for the live map.
 */
export function useGeolocation({ watch = false } = {}) {
  const setCoords = useAppStore((s) => s.setCoords);
  const coords = useAppStore((s) => s.coords);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSuccess = useCallback(
    (position) => {
      setCoords({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp,
      });
      setError(null);
      setLoading(false);
    },
    [setCoords]
  );

  const handleError = useCallback((err) => {
    setError(err.message || 'Location unavailable');
    setLoading(false);
  }, []);

  const refresh = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setError('Geolocation is not supported on this device');
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });
  }, [handleSuccess, handleError]);

  useEffect(() => {
    if (!watch || !('geolocation' in navigator)) return undefined;

    const id = navigator.geolocation.watchPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      maximumAge: 15000,
    });
    return () => navigator.geolocation.clearWatch(id);
  }, [watch, handleSuccess, handleError]);

  useEffect(() => {
    if (!coords) refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { coords, error, loading, refresh };
}
