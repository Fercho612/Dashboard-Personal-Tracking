import { useEffect, useRef, useState } from 'react'
import { getIsoWeekNumber, getWeekDays, toDateKey } from '../../lib/dates.js'
import { getBestStreak, getCurrentStreak, isScheduledOn } from './habitStats.js'

const DAY_INITIALS = ['D', 'L', 'M', 'M', 'J', 'V', 'S'] // índice = getDay()
const DRAG_THRESHOLD_PX = 5 // menos que esto es un clic, no un arrastre

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
  // Solo se bloquea el futuro: cualquier día pasado se puede registrar.
  if (dateKey > todayKey) return { status: 'future', disabled: true }
  if (isDone) return { status: 'done', disabled: false }
  // Días que no le tocan, o anteriores a crear el hábito: atenuados pero marcables.
  if (!isScheduledOn(habit, date) || dateKey < habit.createdAt) return { status: 'off', disabled: false }
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
  onMove,
}) {
  const days = getWeekDays(weekStart)
  const tableRef = useRef(null)
  // Último movimiento hecho con los botones: al reordenarse las filas, el foco puede
  // perderse (o el botón quedar deshabilitado); así se lo devolvemos a quien lo usaba.
  const lastMove = useRef(null)

  useEffect(() => {
    if (!lastMove.current) return
    const { id, direction } = lastMove.current
    lastMove.current = null
    const row = tableRef.current?.querySelector(`[data-habit-id="${id}"]`)
    const wanted = row?.querySelector(`[data-move="${direction}"]`)
    const fallback = row?.querySelector('[data-move]:not(:disabled)')
    ;(wanted && !wanted.disabled ? wanted : fallback)?.focus()
  }, [habits])

  function moveWithButton(index, direction) {
    lastMove.current = { id: habits[index].id, direction }
    onMove(index, direction === 'up' ? index - 1 : index + 1)
  }

  // ---------- Arrastre con la agarradera (mouse y dedo, mismos eventos de puntero) ----------
  // dragRef es la fuente de verdad (los eventos llegan más rápido que los renders);
  // `drag` solo existe para que React vuelva a pintar la fila arrastrada y el destino.
  // { from, to, startY, active } · to = null cuando el puntero está fuera de la tabla.
  const dragRef = useRef(null)
  const [drag, setDrag] = useState(null)

  function updateDrag(next) {
    dragRef.current = next
    setDrag(next)
  }

  // Posición de destino según dónde está el puntero: la fila cuyo centro queda más cerca.
  function getDropIndex(x, y) {
    const table = tableRef.current
    if (!table) return null
    const box = table.getBoundingClientRect()
    if (x < box.left || x > box.right || y < box.top || y > box.bottom) return null
    const centers = [...table.querySelectorAll('tbody tr')].map((row) => {
      const rect = row.getBoundingClientRect()
      return rect.top + rect.height / 2
    })
    return centers.reduce(
      (best, center, index) => (Math.abs(y - center) < Math.abs(y - centers[best]) ? index : best),
      0,
    )
  }

  function startDrag(event, index) {
    if (event.button !== 0) return
    event.currentTarget.setPointerCapture(event.pointerId)
    updateDrag({ from: index, to: index, startY: event.clientY, active: false })
  }

  function moveDrag(event) {
    const current = dragRef.current
    if (!current) return
    // Un clic o toque sin mover no es un arrastre.
    if (!current.active && Math.abs(event.clientY - current.startY) < DRAG_THRESHOLD_PX) return
    updateDrag({ ...current, active: true, to: getDropIndex(event.clientX, event.clientY) })
  }

  function endDrag() {
    const current = dragRef.current
    updateDrag(null)
    if (current?.active && current.to !== null && current.to !== current.from) {
      onMove(current.from, current.to)
    }
  }

  // Escape cancela el arrastre en curso sin cambiar nada.
  const isDragging = drag !== null
  useEffect(() => {
    if (!isDragging) return
    const cancelOnEscape = (event) => {
      if (event.key === 'Escape') updateDrag(null)
    }
    window.addEventListener('keydown', cancelOnEscape)
    return () => window.removeEventListener('keydown', cancelOnEscape)
  }, [isDragging])

  // Línea de destino: arriba de la fila si se sube, abajo si se baja.
  function getDropClass(index) {
    if (!drag?.active || drag.to === null || drag.to === drag.from || index !== drag.to) return ''
    return drag.to < drag.from ? 'is-drop-above' : 'is-drop-below'
  }

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
        <table
          className={`matrix__table${drag?.active ? ' is-reordering' : ''}`}
          ref={tableRef}
        >
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
            {habits.map((habit, index) => {
              const doneDays = completions[habit.id] ?? []
              return (
                <tr
                  key={habit.id}
                  data-habit-id={habit.id}
                  className={`${drag?.active && drag.from === index ? 'is-dragging ' : ''}${getDropClass(index)}`}
                >
                  <th scope="row" className="matrix__habit-col">
                    <div className="matrix__habit">
                      {/* Solo para mouse y dedo: con teclado se usan los botones Subir/Bajar */}
                      <span
                        className="matrix__grip"
                        aria-hidden="true"
                        title="Arrastra para reordenar"
                        onPointerDown={(event) => startDrag(event, index)}
                        onPointerMove={moveDrag}
                        onPointerUp={endDrag}
                        onPointerCancel={() => updateDrag(null)}
                      >
                        ⋮⋮
                      </span>
                      <button type="button" className="matrix__habit-name" onClick={() => onEdit(habit)}
                        title="Editar hábito">
                        {habit.name}
                      </button>
                      <button
                        type="button"
                        className="matrix__move"
                        data-move="up"
                        disabled={index === 0}
                        aria-label={`Subir ${habit.name}`}
                        onClick={() => moveWithButton(index, 'up')}
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        className="matrix__move"
                        data-move="down"
                        disabled={index === habits.length - 1}
                        aria-label={`Bajar ${habit.name}`}
                        onClick={() => moveWithButton(index, 'down')}
                      >
                        ↓
                      </button>
                    </div>
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
