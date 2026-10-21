export default function HabitRanking({ ranking }) {
  return (
    <section className="card">
      <h2 className="card__title">Ranking de hábitos</h2>
      <p className="stats-card__text">De mayor a menor cumplimiento en el período.</p>

      {ranking.length === 0 ? (
        <p className="stats-card__hint">Sin hábitos programados en este período.</p>
      ) : (
        <ol className="ranking">
          {ranking.map((item) => (
            <li key={item.id} className="ranking__item">
              <div className="ranking__row">
                <span className="ranking__name">{item.name}</span>
                <span className="ranking__numbers">
                  {item.done} de {item.total} · <strong>{item.rate}%</strong>
                </span>
              </div>
              <div className="stats-progress" aria-hidden="true">
                <div className="stats-progress__fill" style={{ width: `${item.rate}%` }} />
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
