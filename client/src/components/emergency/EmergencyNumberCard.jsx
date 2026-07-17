import { buildTelLink } from '../../utils/deepLinks.js';

export default function EmergencyNumberCard({ label, number, type }) {
  return (
    <a
      href={buildTelLink(number)}
      className="tap-target card flex items-center justify-between px-4 py-4 active:bg-surface2 transition-colors"
      aria-label={`Call ${label}, ${number}`}
    >
      <span>
        <span className="block font-semibold">{label}</span>
        <span className="block text-xs text-muted capitalize">{type}</span>
      </span>
      <span className="flex items-center gap-2 text-signal font-display font-bold text-xl">
        {number}
        <CallIcon className="w-5 h-5" />
      </span>
    </a>
  );
}

function CallIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M6.6 10.8c1.3 2.6 3.4 4.7 6 6l2-2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.5.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.8c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.5.1.4 0 .8-.2 1l-2.1 2.3Z" />
    </svg>
  );
}
