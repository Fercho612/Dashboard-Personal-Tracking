// Íconos SVG escritos a mano: así no dependemos de una librería ni de un CDN de íconos.
const icons = {
  habits: (
    <path d="M9 12l2 2 4-4M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z" />
  ),
  calendar: (
    <path d="M8 3v4M16 3v4M3 10h18M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" />
  ),
  tasks: <path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" />,
  stats: <path d="M3 17l6-6 4 4 8-8M15 7h6v6" />,
}

function Icon({ name }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {icons[name]}
    </svg>
  )
}

// Las secciones sin implementar quedan visibles pero deshabilitadas.
const NAV_ITEMS = [
  { id: 'habits', label: 'Hábitos', enabled: true },
  { id: 'calendar', label: 'Calendario Semanal', enabled: true },
  { id: 'tasks', label: 'Lista de Tareas', enabled: false },
  { id: 'stats', label: 'Estadísticas', enabled: false },
]

export default function Sidebar({ activeSection, onNavigate }) {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <div className="sidebar__logo">
          <Icon name="stats" />
        </div>
        <div>
          <p className="sidebar__title">FocusPulse</p>
          <p className="sidebar__subtitle">Mindful Momentum</p>
        </div>
      </div>

      <nav className="sidebar__nav" aria-label="Secciones">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`nav-item ${item.id === activeSection ? 'nav-item--active' : ''}`}
            disabled={!item.enabled}
            aria-current={item.id === activeSection ? 'page' : undefined}
            title={item.enabled ? item.label : `${item.label} (próximamente)`}
            onClick={() => onNavigate(item.id)}
          >
            <Icon name={item.id} />
            <span className="nav-item__label">{item.label}</span>
            {!item.enabled && <span className="nav-item__soon">Pronto</span>}
          </button>
        ))}
      </nav>
    </aside>
  )
}
