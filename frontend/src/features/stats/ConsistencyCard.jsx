const pluralDays = (count) => `${count} ${count === 1 ? 'día' : 'días'}`

export default function ConsistencyCard({ perfect }) {
  const { perfectDays, activeDays, longestStreak } = perfect

  return (
    <section className="card stats-card">
      <h2 className="stats-card__label">Constancia</h2>
      <strong className="stats-card__value">{pluralDays(longestStreak)}</strong>
      <p className="stats-card__text">Mejor racha de días perfectos del período</p>
      <p className="stats-card__hint">
        {perfectDays} de {activeDays} {activeDays === 1 ? 'día perfecto' : 'días perfectos'}
      </p>
    </section>
  )
}
