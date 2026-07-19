import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../store/appStore.js';

/**
 * App-wide banner shown while disaster mode is active. Rendered inside the
 * sticky banner stack in App (below the offline banner).
 */
export default function DisasterBanner() {
  const { t } = useTranslation();
  const disasterMode = useAppStore((s) => s.disasterMode);

  if (!disasterMode) return null;

  return (
    <div
      role="status"
      className="flex items-center justify-center gap-2 bg-alert/15 border-b border-alert/40 text-alert text-xs font-medium py-2 px-3"
    >
      <AlertIcon className="w-4 h-4 shrink-0" />
      <span>{t('disaster.banner')}</span>
    </div>
  );
}

function AlertIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M12 3 2 20h20L12 3Z" strokeLinejoin="round" />
      <path d="M12 10v4M12 17.5v.5" strokeLinecap="round" />
    </svg>
  );
}
