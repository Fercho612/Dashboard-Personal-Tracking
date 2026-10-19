import { getCategoryColor } from './palette.js'
import { toTimeLabel } from './scheduleUtils.js'

// Un bloque dentro de su columna. La posición vertical y la altura salen de variables CSS:
// --offset (minutos desde el inicio de la franja) y --duration (minutos que dura).
export default function ScheduleBlock({ block, category, dayStart, onClick }) {
  const duration = block.end - block.start
  const timeLabel = `${toTimeLabel(block.start)}–${toTimeLabel(block.end)}`

  return (
    <div
      className={`block ${duration < 45 ? 'block--compact' : ''}`}
      style={{
        '--offset': block.start - dayStart,
        '--duration': duration,
        '--cat': getCategoryColor(category?.color),
      }}
    >
      <button
        type="button"
        className="block__body"
        onClick={() => onClick(block)}
        aria-label={`${block.title}, ${timeLabel}. Editar bloque`}
      >
        <span className="block__title">{block.title}</span>
        <span className="block__time">{timeLabel}</span>
      </button>
    </div>
  )
}
