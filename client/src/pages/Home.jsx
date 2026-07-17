import { useMemo } from 'react';
import emergencyNumbers from '../data/emergencyNumbers.json';
import EmergencyNumberCard from '../components/emergency/EmergencyNumberCard.jsx';
import SOSButton from '../components/sos/SOSButton.jsx';
import VoiceAssistant from '../components/voice/VoiceAssistant.jsx';
import { useGeolocation } from '../hooks/useGeolocation.js';
import { useAppStore } from '../store/appStore.js';
import { detectRegion } from '../utils/detectRegion.js';

export default function Home() {
  const { coords } = useGeolocation();
  const regionOverride = useAppStore((s) => s.region);

  const regionCode = useMemo(() => {
    if (regionOverride !== 'default') return regionOverride;
    return detectRegion(coords);
  }, [coords, regionOverride]);

  const entry = emergencyNumbers[regionCode] || emergencyNumbers.default;

  return (
    <div className="px-4 pt-6 pb-28 space-y-8 max-w-lg mx-auto">
      <header>
        <h1 className="font-display text-2xl font-bold">SafetyHub</h1>
        <p className="text-muted text-sm mt-1">Find what you need, right now, right here.</p>
      </header>

      <section aria-labelledby="sos-heading" className="flex flex-col items-center py-2">
        <h2 id="sos-heading" className="sr-only">
          Send an SOS
        </h2>
        <SOSButton />
      </section>

      <section aria-labelledby="numbers-heading" className="space-y-3">
        <div className="flex items-baseline justify-between">
          <h2 id="numbers-heading" className="font-display font-semibold text-lg">
            Emergency numbers
          </h2>
          <span className="text-xs text-muted">{entry.country}</span>
        </div>
        <div className="space-y-2">
          {entry.numbers.map((n) => (
            <EmergencyNumberCard key={n.number} {...n} />
          ))}
        </div>
      </section>

      <section aria-labelledby="voice-heading" className="space-y-3">
        <h2 id="voice-heading" className="font-display font-semibold text-lg">
          Voice assistant
        </h2>
        <VoiceAssistant />
      </section>
    </div>
  );
}
