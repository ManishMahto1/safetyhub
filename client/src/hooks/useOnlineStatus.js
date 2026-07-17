import { useEffect } from 'react';
import { useAppStore } from '../store/appStore.js';

/**
 * Mirrors navigator.onLine into the global store so any component
 * (OfflineBanner, MapView, VoiceAssistant) can react without its own listener.
 */
export function useOnlineStatus() {
  const isOffline = useAppStore((s) => s.isOffline);
  const setOffline = useAppStore((s) => s.setOffline);

  useEffect(() => {
    const goOnline = () => setOffline(false);
    const goOffline = () => setOffline(true);

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, [setOffline]);

  return isOffline;
}
