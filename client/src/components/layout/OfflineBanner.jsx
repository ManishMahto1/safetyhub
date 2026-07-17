import { useOnlineStatus } from '../../hooks/useOnlineStatus.js';

export default function OfflineBanner() {
  const isOffline = useOnlineStatus();

  if (!isOffline) return null;

  return (
    <div
      role="status"
      className="sticky top-0 z-50 flex items-center justify-center gap-2 bg-signal/15 border-b border-signal/30 text-signal text-xs font-medium py-2 px-3"
    >
      <OfflineIcon className="w-4 h-4 shrink-0" />
      <span>Offline — emergency numbers and saved contacts still work</span>
    </div>
  );
}

function OfflineIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M3 3l18 18" strokeLinecap="round" />
      <path
        d="M8.5 8.7A9 9 0 0 0 3.5 11M12 20h.01M6.5 15.2a6 6 0 0 1 3-2M20.5 11a9 9 0 0 0-3.4-2.3M9.5 5.1A9 9 0 0 1 20.5 11"
        strokeLinecap="round"
      />
    </svg>
  );
}
