import { getCategoryColor } from './palette.js'
import { formatDuration, getMinutesByCategory } from './scheduleUtils.js'

/**
 * Resumen de horas planificadas: total + barra apilada por categoría + leyenda.
 * La leyenda siempre muestra nombre y horas: el color nunca es la única forma de
 * identificar una categoría (accesible para daltonismo).
 * Cuenta TODOS los bloques, sin importar los filtros activos.
 */
export default function HoursSummary({ blocks, categories }) {
  const { total, byCategory } = getMinutesByCategory(blocks, categories)
  const withTime = byCategory.filter((item) => item.minutes > 0)
  const percent = (minutes) => Math.round((minutes / total) * 100)

  return (
    <section className="card hours-summary" aria-labelledby="hours-summary-title">
      <div className="hours-summary__total">
        <span id="hours-summary-title" className="stat__label">
          Horas planificadas
        </span>
        <strong className="hours-summary__value">{total === 0 ? '0 h' : formatDuration(total)}</strong>
        <span className="stat__hint">por semana</span>
      </div>

      <div className="hours-summary__detail">
        {total === 0 ? (
          <p className="field__hint">Todavía no hay bloques. Haz clic en la grilla para crear el primero.</p>
        ) : (
          // Cada segmento ocupa una fracción del ancho proporcional a sus minutos (flex-grow).
          <div className="stacked-bar" role="img" aria-label="Distribución de horas por categoría">
            {withTime.map(({ category, minutes }) => (
              <span
                key={category.id}
                className="stacked-bar__segment"
                style={{ flexGrow: minutes, '--cat': getCategoryColor(category.color) }}
                title={`${category.name}: ${formatDuration(minutes)} (${percent(minutes)}%)`}
              />
            ))}
          </div>
        )}

        <ul className="hours-legend">
          {byCategory.map(({ category, minutes }) => (
            <li
              key={category.id}
              className={`hours-legend__item ${minutes === 0 ? 'is-empty' : ''}`}
              style={{ '--cat': getCategoryColor(category.color) }}
            >
              <span className="category-dot" aria-hidden="true" />
              <span className="hours-legend__name">{category.name}</span>
              <span className="hours-legend__value">
                {minutes === 0 ? '—' : `${formatDuration(minutes)} · ${percent(minutes)}%`}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
