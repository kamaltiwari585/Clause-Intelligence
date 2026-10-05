import { NAV_ITEMS } from '../config/constants';

export default function Sidebar({ active, onNavigate }) {
  return (
    <aside className="sidebar" aria-label="Primary">
      <div className="sidebar__brand">Clause<span>Intelligence</span></div>
      <nav>
        <ul>
          {NAV_ITEMS.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className={`nav-item ${active === item.id ? 'is-active' : ''}`}
                aria-current={active === item.id ? 'page' : undefined}
                onClick={() => onNavigate(item.id)}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
