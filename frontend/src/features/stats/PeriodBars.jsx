export default function PeriodBars({ bars, byDay }) {
  return (
    <section className="card">
      <h2 className="card__title">Cumplimiento {byDay ? 'por día' : 'por semana'}</h2>
      <p className="stats-card__text">
        {byDay ? 'Porcentaje cumplido en cada día de la semana.' : 'Porcentaje cumplido en cada semana del período.'}
      </p>

      <ul className="bars">
        {bars.map((bar) => (
          <li
            key={bar.label}
            className="bars__item"
            title={bar.total === 0 ? 'Sin hábitos programados' : `${bar.done} de ${bar.total} registros`}
          >
            <span className="bars__value">{bar.rate === null ? '—' : `${bar.rate}%`}</span>
            <div className="bars__track">
              {/* El alto de la barra es su % de cumplimiento; sin datos no se dibuja barra */}
              {bar.rate !== null && <div className="bars__fill" style={{ height: `${Math.max(bar.rate, 2)}%` }} />}
            </div>
            <span className="bars__label">{bar.label}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
