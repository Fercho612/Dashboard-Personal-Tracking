import { getBestStreak, getConsistency, getGlobalStreak, getTodayProgress } from './habitStats.js'

// Anillo de progreso en SVG: un círculo de fondo y otro encima con el trazo "recortado".
// stroke-dasharray = largo total del trazo; stroke-dashoffset = cuánto se oculta.
function ProgressRing({ percent }) {
  const radius = 42
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - percent / 100)

  return (
    <svg className="ring" viewBox="0 0 100 100" aria-hidden="true">
      <circle className="ring__track" cx="50" cy="50" r={radius} />
      <circle
        className="ring__value"
        cx="50"
        cy="50"
        r={radius}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
      />
    </svg>
  )
}

const pluralDays = (count) => `${count} ${count === 1 ? 'día' : 'días'}`

export default function TodaySummary({ habits, completions, today }) {
  const { done, total } = getTodayProgress(habits, completions, today)
  const percent = total === 0 ? 0 : Math.round((done / total) * 100)
  const globalStreak = getGlobalStreak(habits, completions, today)
  const consistency = getConsistency(habits, completions, today)

  // El récord a mostrar es la mejor racha entre todos los hábitos.
  const record = habits
    .map((habit) => ({ name: habit.name, best: getBestStreak(habit, completions, today) }))
    .reduce((top, current) => (current.best > top.best ? current : top), { name: '', best: 0 })

  return (
    <section className="summary">
      <div className="card summary__today">
        <div className="summary__ring">
          <ProgressRing percent={percent} />
          <div className="summary__ring-label">
            <strong>{total === 0 ? '—' : `${percent}%`}</strong>
            <span>Hoy</span>
          </div>
        </div>
        <div>
          <h2 className="card__title">Cumplimiento de hoy</h2>
          <p className="summary__text">
            {total === 0
              ? 'Hoy no tienes hábitos programados.'
              : `${done} de ${total} hábitos completados hoy.`}
          </p>
        </div>
      </div>

      <div className="card stat">
        <span className="stat__label">Racha actual</span>
        <strong className="stat__value">{pluralDays(globalStreak)}</strong>
        <span className="stat__hint">Días seguidos con todo cumplido</span>
      </div>

      <div className="card stat">
        <span className="stat__label">Consistencia</span>
        <strong className="stat__value stat__value--primary">
          {consistency === null ? '—' : `${consistency}%`}
        </strong>
        <span className="stat__hint">Últimos 30 días</span>
      </div>

      <div className="card stat">
        <span className="stat__label">Racha récord</span>
        <strong className="stat__value stat__value--success">{pluralDays(record.best)}</strong>
        <span className="stat__hint">{record.best > 0 ? record.name : 'Aún sin récord'}</span>
      </div>
    </section>
  )
}
