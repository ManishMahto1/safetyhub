const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'hospital', label: 'Hospitals' },
  { id: 'pharmacy', label: 'Pharmacies' },
  { id: 'police', label: 'Police' },
  { id: 'bank', label: 'Banks' },
  { id: 'fuel', label: 'Fuel' },
  { id: 'fire-station', label: 'Fire stations' },
];

export default function CategoryFilterChips({ active, onChange }) {
  return (
    <div
      className="flex gap-2 overflow-x-auto px-4 py-3 no-scrollbar"
      role="tablist"
      aria-label="Filter places by category"
    >
      {CATEGORIES.map(({ id, label }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(id)}
            className={`tap-target shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              isActive ? 'bg-signal text-ink' : 'bg-surface text-muted'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
