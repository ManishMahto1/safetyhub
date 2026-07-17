import { NavLink } from 'react-router-dom';

const TABS = [
  { to: '/', label: 'Home', icon: HomeIcon },
  { to: '/map', label: 'Map', icon: MapIcon },
  { to: '/contacts', label: 'Contacts', icon: ContactsIcon },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
];

export default function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 bg-surface border-t border-white/5 pb-[env(safe-area-inset-bottom)]"
      aria-label="Primary"
    >
      <ul className="flex justify-around">
        {TABS.map(({ to, label, icon: Icon }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `tap-target flex flex-col items-center justify-center gap-1 py-2 text-xs font-medium transition-colors ${
                  isActive ? 'text-signal' : 'text-muted hover:text-mist'
                }`
              }
            >
              <Icon className="w-6 h-6" />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function HomeIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M3 11.5 12 4l9 7.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 10v9h14v-9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MapIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path
        d="M9 4 3 6.5v14L9 18l6 2.5L21 18V4l-6 2.5L9 4Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M9 4v14M15 6.5v14" strokeLinecap="round" />
    </svg>
  );
}

function ContactsIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 20c1-3.5 4-5.5 7.5-5.5s6.5 2 7.5 5.5" strokeLinecap="round" />
    </svg>
  );
}

function SettingsIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <circle cx="12" cy="12" r="3" />
      <path
        d="M19.4 13a7.6 7.6 0 0 0 0-2l2-1.5-2-3.5-2.4.7a7.7 7.7 0 0 0-1.7-1L14.8 3h-4l-.5 2.7a7.7 7.7 0 0 0-1.7 1L6.2 6l-2 3.5L6.2 11a7.6 7.6 0 0 0 0 2l-2 1.5 2 3.5 2.4-.7a7.7 7.7 0 0 0 1.7 1l.5 2.7h4l.5-2.7a7.7 7.7 0 0 0 1.7-1l2.4.7 2-3.5-2-1.5Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
