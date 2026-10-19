import { getIsoWeekNumber, getWeekDays, toDateKey } from '../../lib/dates.js'
import { getBestStreak, getCurrentStreak, isScheduledOn } from './habitStats.js'

const DAY_INITIALS = ['D', 'L', 'M', 'X', 'J', 'V', 'S'] // índice = getDay()

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12l5 5L20 7" />
    </svg>
  )
}

// Decide cómo se ve y si se puede clickear una celda (hábito × día).
function getCellState({ habit, date, dateKey, todayKey, isDone }) {
  if (dateKey > todayKey) return { status: 'future', disabled: true }
  // Antes de crear el hábito no hay nada que registrar (y no cuenta en las métricas).
  if (dateKey < habit.createdAt) return { status: 'inactive', disabled: true }
  if (isDone) return { status: 'done', disabled: false }
  if (!isScheduledOn(habit, date)) return { status: 'off', disabled: false }
  return { status: 'pending', disabled: false }
}

export default function WeeklyMatrix({
  habits,
  completions,
  weekStart,
  today,
  onToggle,
  onPrevWeek,
  onNextWeek,
  onGoToToday,
  onEdit,
}) {
  const days = getWeekDays(weekStart)
  const todayKey = toDateKey(today)
  const isCurrentWeek = days.some((day) => toDateKey(day) === todayKey)

  // Usamos el jueves para nombrar el mes, igual que la numeración ISO de semanas.
  const monthLabel = days[3].toLocaleDateString('es', { month: 'long' })

  return (
    <section className="card matrix">
      <header className="matrix__header">
        <h2 className="card__title">Matriz semanal de consistencia</h2>
        <div className="matrix__nav">
          <span className="matrix__week">
            Semana {getIsoWeekNumber(weekStart)} • <span className="capitalize">{monthLabel}</span>
          </span>
          {!isCurrentWeek && (
            <button type="button" className="btn btn--ghost btn--small" onClick={onGoToToday}>
              Hoy
            </button>
          )}
          <button type="button" className="icon-btn" onClick={onPrevWeek} aria-label="Semana anterior">
            ‹
          </button>
          <button type="button" className="icon-btn" onClick={onNextWeek} aria-label="Semana siguiente">
            ›
          </button>
        </div>
      </header>

      {/* El contenedor con overflow permite scroll horizontal en pantallas chicas */}
      <div className="matrix__scroll">
        <table className="matrix__table">
          <thead>
            <tr>
              <th scope="col" className="matrix__habit-col">Hábito</th>
              {days.map((day) => {
                const isToday = toDateKey(day) === todayKey
                return (
                  <th key={toDateKey(day)} scope="col" className={isToday ? 'is-today' : undefined}>
                    {DAY_INITIALS[day.getDay()]}
                    <span className="matrix__day-num">{day.getDate()}</span>
                  </th>
                )
              })}
              <th scope="col" className="matrix__streak-col">Racha</th>
            </tr>
          </thead>
          <tbody>
            {habits.map((habit) => {
              const doneDays = completions[habit.id] ?? []
              return (
                <tr key={habit.id}>
                  <th scope="row" className="matrix__habit-col">
                    <button type="button" className="matrix__habit-name" onClick={() => onEdit(habit)}
                      title="Editar hábito">
                      {habit.name}
                    </button>
                  </th>
                  {days.map((day) => {
                    const dateKey = toDateKey(day)
                    const isDone = doneDays.includes(dateKey)
                    const { status, disabled } = getCellState({ habit, date: day, dateKey, todayKey, isDone })
                    return (
                      <td key={dateKey}>
                        <button
                          type="button"
                          className={`matrix__cell matrix__cell--${status}`}
                          disabled={disabled}
                          aria-pressed={isDone}
                          aria-label={`${habit.name}, ${day.toLocaleDateString('es')}: ${isDone ? 'hecho' : 'no hecho'}`}
                          onClick={() => onToggle(habit.id, dateKey)}
                        >
                          {isDone && <CheckIcon />}
                        </button>
                      </td>
                    )
                  })}
                  <td className="matrix__streak-col">
                    <strong>{getCurrentStreak(habit, completions, today)}</strong>
                    <span className="matrix__streak-best">
                      récord {getBestStreak(habit, completions, today)}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
