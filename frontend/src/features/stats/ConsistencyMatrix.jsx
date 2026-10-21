import { useState } from 'react'

// Texto de detalle de un día: "miércoles, 21 de octubre · 1 de 1 hábitos".
function describeCell(cell) {
  const dateLabel = cell.date.toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })
  const summary = cell.total === 0 ? 'Sin hábitos programados' : `${cell.done} de ${cell.total} hábitos`
  return `${dateLabel} · ${summary}`
}

export default function ConsistencyMatrix({ weeks, monthLabels }) {
  // Celda sobre la que está el puntero o el foco. Se queda mostrada al salir, así
  // el detalle también se puede leer en pantallas táctiles.
  const [activeCell, setActiveCell] = useState(null)

  return (
    <section className="card">
      <div className="stats-section__header">
        <div>
          <h2 className="card__title">Matriz de consistencia</h2>
          <p className="stats-card__text">Cumplimiento diario de las últimas 17 semanas.</p>
        </div>
        <ul className="heat-legend" aria-label="Leyenda">
          <li>Sin datos</li>
          <li className="heat-cell heat-cell--none" aria-hidden="true" />
          <li>Menos</li>
          {[0, 1, 2, 3, 4].map((level) => (
            <li key={level} className={`heat-cell heat-cell--${level}`} aria-hidden="true" />
          ))}
          <li>Más</li>
        </ul>
      </div>

      <div className="heat__scroll">
        <div className="heat">
          <div className="heat__months" aria-hidden="true">
            {monthLabels.map((label, index) => (
              <span key={index}>{label}</span>
            ))}
          </div>
          <div className="heat__grid">
            {weeks.map((week) => (
              <div key={week[0].key} className="heat__week">
                {week.map((cell) => (
                  <button
                    key={cell.key}
                    type="button"
                    className={`heat-cell heat-cell--${cell.level ?? 'none'}`}
                    aria-label={describeCell(cell)}
                    onMouseEnter={() => setActiveCell(cell)}
                    onFocus={() => setActiveCell(cell)}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="heat__detail" aria-live="polite">
        {activeCell ? describeCell(activeCell) : 'Pasa el cursor o enfoca un día para ver su detalle.'}
      </p>
    </section>
  )
}
