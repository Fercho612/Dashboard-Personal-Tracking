// Diferencia en puntos porcentuales con signo: "+6 pts", "−3 pts" (signo menos real) o "0 pts".
function formatDifference(points) {
  if (points > 0) return `+${points} pts`
  if (points < 0) return `−${Math.abs(points)} pts`
  return '0 pts'
}

export default function ComplianceCard({ current, previous, previousLabel }) {
  const hasData = current.total > 0

  let comparison = null
  if (hasData) {
    comparison =
      previous.rate === null
        ? 'Sin datos del período anterior'
        : `${formatDifference(current.rate - previous.rate)} vs. ${previousLabel}`
  }

  return (
    <section className="card stats-card">
      <h2 className="stats-card__label">Tasa de cumplimiento</h2>
      <strong className="stats-card__value">{hasData ? `${current.rate}%` : '—'}</strong>
      <p className="stats-card__text">
        {hasData ? `${current.done} de ${current.total} registros cumplidos` : 'Sin hábitos programados en este período'}
      </p>
      {hasData && (
        <div className="stats-progress" aria-hidden="true">
          <div className="stats-progress__fill" style={{ width: `${current.rate}%` }} />
        </div>
      )}
      {comparison && <p className="stats-card__hint">{comparison}</p>}
    </section>
  )
}
