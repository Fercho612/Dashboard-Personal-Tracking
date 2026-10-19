import ScheduleBlock from './ScheduleBlock.jsx'
import { DAY_SHORT, SLOT_MINUTES, WEEK_ORDER, toTimeLabel } from './scheduleUtils.js'

// Alto de una hora en la grilla. JS lo necesita para traducir píxeles ↔ minutos
// (clic en un hueco, redimensionado) y CSS lo recibe como variable.
export const HOUR_HEIGHT = 56
export const PX_PER_MINUTE = HOUR_HEIGHT / 60

export default function WeekGrid({ blocks, categories, settings, onBlockClick, onSlotClick }) {
  const { dayStart, dayEnd } = settings
  const todayIndex = new Date().getDay()

  // Etiquetas de hora: una por cada hora entera de la franja (la última solo marca el cierre).
  const hours = []
  for (let minutes = dayStart; minutes <= dayEnd; minutes += 60) hours.push(minutes)

  const categoryById = Object.fromEntries(categories.map((category) => [category.id, category]))

  // Clic en un hueco vacío de la columna: calculamos la hora según la altura del clic.
  function handleColumnClick(event, day) {
    if (event.target !== event.currentTarget) return // el clic fue sobre un bloque
    const rect = event.currentTarget.getBoundingClientRect()
    const minutesFromTop = (event.clientY - rect.top) / PX_PER_MINUTE
    const start = dayStart + Math.floor(minutesFromTop / SLOT_MINUTES) * SLOT_MINUTES
    onSlotClick(day, start)
  }

  return (
    <div className="week-grid__scroll">
      <div
        className="week-grid"
        style={{ '--hour-height': `${HOUR_HEIGHT}px`, '--total-minutes': dayEnd - dayStart }}
      >
        {/* Cabecera: celda vacía sobre la columna de horas + un encabezado por día */}
        <div className="week-grid__corner" />
        {WEEK_ORDER.map((day) => (
          <div key={day} className={`week-grid__day-header ${day === todayIndex ? 'is-today' : ''}`}>
            {DAY_SHORT[day]}
            {day === todayIndex && <span className="week-grid__today-pill">Hoy</span>}
          </div>
        ))}

        <div className="week-grid__hours" aria-hidden="true">
          {hours.map((minutes) => (
            <span key={minutes} className="week-grid__hour" style={{ '--offset': minutes - dayStart }}>
              {toTimeLabel(minutes)}
            </span>
          ))}
        </div>

        {WEEK_ORDER.map((day) => (
          <div
            key={day}
            className={`week-grid__column ${day === todayIndex ? 'is-today' : ''}`}
            onClick={(event) => handleColumnClick(event, day)}
          >
            {blocks
              .filter((block) => block.day === day)
              .map((block) => (
                <ScheduleBlock
                  key={block.id}
                  block={block}
                  category={categoryById[block.categoryId]}
                  dayStart={dayStart}
                  onClick={onBlockClick}
                />
              ))}
          </div>
        ))}
      </div>
    </div>
  )
}
