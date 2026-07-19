import { useTranslation } from 'react-i18next';
import emergencyNumbers from '../data/emergencyNumbers.json';
import { useAppStore } from '../store/appStore.js';
import { useOnlineStatus } from '../hooks/useOnlineStatus.js';
import {
  SUPPORTED_LANGUAGES,
  getLanguagePref,
  applyLanguagePref,
} from '../i18n/index.js';

const REGION_OPTIONS = Object.entries(emergencyNumbers)
  .filter(([code]) => code !== 'default')
  .map(([code, { country }]) => ({ code, country }))
  .sort((a, b) => a.country.localeCompare(b.country));

export default function Settings() {
  const { t } = useTranslation();
  const region = useAppStore((s) => s.region);
  const setRegion = useAppStore((s) => s.setRegion);
  const disasterMode = useAppStore((s) => s.disasterMode);
  const setDisasterMode = useAppStore((s) => s.setDisasterMode);
  const isOffline = useOnlineStatus();
  const langPref = getLanguagePref();

  return (
    <div className="px-4 pt-6 pb-28 space-y-6 max-w-lg mx-auto">
      <header>
        <h1 className="font-display text-2xl font-bold">{t('settings.title')}</h1>
      </header>

      <section className="card p-4 space-y-3">
        <h2 className="font-semibold">{t('settings.language')}</h2>
        <p className="text-xs text-muted">{t('settings.languageHelp')}</p>
        <select
          value={langPref}
          onChange={(e) => applyLanguagePref(e.target.value)}
          className="w-full rounded-lg bg-surface2 px-3 py-2.5"
        >
          <option value="auto">{t('settings.languageAuto')}</option>
          {SUPPORTED_LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>
              {l.label}
            </option>
          ))}
        </select>
      </section>

      <section className="card p-4 space-y-3">
        <h2 className="font-semibold">{t('settings.region')}</h2>
        <p className="text-xs text-muted">{t('settings.regionHelp')}</p>
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="w-full rounded-lg bg-surface2 px-3 py-2.5"
        >
          <option value="default">{t('settings.regionAuto')}</option>
          {REGION_OPTIONS.map((r) => (
            <option key={r.code} value={r.code}>
              {r.country}
            </option>
          ))}
        </select>
      </section>

      <section className="card p-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-semibold">{t('disaster.settingsTitle')}</h2>
          <button
            type="button"
            role="switch"
            aria-checked={disasterMode}
            aria-label={t('disaster.settingsTitle')}
            onClick={() => setDisasterMode(!disasterMode)}
            className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
              disasterMode ? 'bg-alert' : 'bg-surface2'
            }`}
          >
            <span
              className={`absolute top-1 h-5 w-5 rounded-full bg-mist transition-transform ${
                disasterMode ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        <p className="text-xs text-muted">{t('disaster.settingsHelp')}</p>
      </section>

      <section className="card p-4 space-y-2">
        <h2 className="font-semibold">{t('settings.connection')}</h2>
        <p className="text-sm">
          {t('settings.status')}{' '}
          <span className={isOffline ? 'text-alert' : 'text-calm'}>
            {isOffline ? t('settings.offline') : t('settings.online')}
          </span>
        </p>
        <p className="text-xs text-muted">{t('settings.connectionHelp')}</p>
      </section>

      <section className="card p-4 space-y-2">
        <h2 className="font-semibold">{t('settings.about')}</h2>
        <p className="text-xs text-muted">{t('settings.aboutText')}</p>
      </section>
    </div>
  );
}
