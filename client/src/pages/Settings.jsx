import emergencyNumbers from '../data/emergencyNumbers.json';
import { useAppStore } from '../store/appStore.js';
import { useOnlineStatus } from '../hooks/useOnlineStatus.js';

const REGION_OPTIONS = Object.entries(emergencyNumbers).map(([code, { country }]) => ({
  code,
  country,
}));

export default function Settings() {
  const region = useAppStore((s) => s.region);
  const setRegion = useAppStore((s) => s.setRegion);
  const isOffline = useOnlineStatus();

  return (
    <div className="px-4 pt-6 pb-28 space-y-6 max-w-lg mx-auto">
      <header>
        <h1 className="font-display text-2xl font-bold">Settings</h1>
      </header>

      <section className="card p-4 space-y-3">
        <h2 className="font-semibold">Region</h2>
        <p className="text-xs text-muted">
          SafetyHub detects your country automatically from your location. Override it here if
          detection gets it wrong.
        </p>
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="w-full rounded-lg bg-surface2 px-3 py-2.5"
        >
          <option value="default">Auto-detect</option>
          {REGION_OPTIONS.filter((r) => r.code !== 'default').map((r) => (
            <option key={r.code} value={r.code}>
              {r.country}
            </option>
          ))}
        </select>
      </section>

      <section className="card p-4 space-y-2">
        <h2 className="font-semibold">Connection</h2>
        <p className="text-sm">
          Status: <span className={isOffline ? 'text-alert' : 'text-calm'}>{isOffline ? 'Offline' : 'Online'}</span>
        </p>
        <p className="text-xs text-muted">
          Emergency numbers and saved contacts always work offline. The map and voice assistant
          need a connection.
        </p>
      </section>

      <section className="card p-4 space-y-2">
        <h2 className="font-semibold">About</h2>
        <p className="text-xs text-muted">
          SafetyHub is open source under the MIT license. Built for the OpenAI Codex Hackathon,
          July 2026.
        </p>
      </section>
    </div>
  );
}
