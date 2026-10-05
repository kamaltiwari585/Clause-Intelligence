import { FILTERS } from '../config/constants';

export default function FilterBar({ active, counts, onChange }) {
  return (
    <div className="filters" role="group" aria-label="Filter clauses">
      {FILTERS.map((f) => (
        <button
          key={f.id}
          type="button"
          className={`chip ${active === f.id ? 'is-active' : ''}`}
          aria-pressed={active === f.id}
          onClick={() => onChange(f.id)}
        >
          {f.label} <span className="chip__count">{counts[f.id]}</span>
        </button>
      ))}
    </div>
  );
}
