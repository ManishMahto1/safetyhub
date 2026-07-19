import { useTranslation } from 'react-i18next';

const CATEGORY_IDS = ['all', 'hospital', 'pharmacy', 'police', 'bank', 'fuel', 'fire-station'];

export default function CategoryFilterChips({ active, onChange }) {
  const { t } = useTranslation();
  return (
    <div
      className="flex gap-2 overflow-x-auto px-4 py-3 no-scrollbar"
      role="tablist"
      aria-label={t('map.filterAria')}
    >
      {CATEGORY_IDS.map((id) => {
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
            {t(`categories.${id}`)}
          </button>
        );
      })}
    </div>
  );
}
