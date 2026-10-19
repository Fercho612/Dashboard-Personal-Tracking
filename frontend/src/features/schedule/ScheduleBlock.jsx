import { useEffect, useRef, useState } from 'react'
import { getCategoryColor } from './palette.js'
import { PX_PER_MINUTE, toTimeLabel } from './scheduleUtils.js'

/**
 * Un bloque dentro de su columna. La posición vertical y la altura salen de variables CSS:
 * --offset (minutos desde el inicio de la franja) y --duration (minutos que dura).
 *
 * Redimensionado: mientras se arrastra una manija, el bloque muestra una vista previa
 * (`preview`) sin tocar los datos; recién al soltar se avisa con onResizeEnd.
 */
export default function ScheduleBlock({ block, category, dayStart, onClick, getResized, onResizeEnd }) {
  const [preview, setPreview] = useState(null) // { start, end } durante el arrastre
  // useRef guarda datos del arrastre que NO necesitan re-renderizar (posición inicial, borde).
  const dragRef = useRef(null)

  const start = preview?.start ?? block.start
  const end = preview?.end ?? block.end
  const duration = end - start
  const timeLabel = `${toTimeLabel(start)}–${toTimeLabel(end)}`

  function handlePointerDown(event, edge) {
    event.preventDefault()
    event.stopPropagation()
    // Pointer capture: seguimos recibiendo los movimientos aunque el puntero salga de la manija.
    event.currentTarget.setPointerCapture(event.pointerId)
    const initial = { start: block.start, end: block.end }
    dragRef.current = { edge, startY: event.clientY, origin: block[edge], latest: initial }
    setPreview(initial)
  }

  function handlePointerMove(event) {
    const drag = dragRef.current
    if (!drag) return
    const deltaMinutes = (event.clientY - drag.startY) / PX_PER_MINUTE
    // Guardamos el último valor también en el ref: al soltar lo leemos de ahí,
    // por si el estado todavía no se actualizó con el último movimiento.
    drag.latest = getResized(drag.edge, drag.origin + deltaMinutes)
    setPreview(drag.latest)
  }

  function handlePointerUp() {
    const drag = dragRef.current
    if (!drag) return
    dragRef.current = null
    if (drag.latest.start !== block.start || drag.latest.end !== block.end) {
      onResizeEnd(block, drag.latest)
    }
    setPreview(null)
  }

  // Mientras se arrastra, Esc cancela y el bloque vuelve a su tamaño original.
  const isResizing = preview !== null
  useEffect(() => {
    if (!isResizing) return
    function handleKeyDown(event) {
      if (event.key !== 'Escape') return
      dragRef.current = null
      setPreview(null)
    }
    window.addEventListener('keydown', handleKeyDown)
    // La función de limpieza quita el listener cuando termina el arrastre.
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isResizing])

  const handleProps = (edge) => ({
    className: `block__handle block__handle--${edge}`,
    'aria-hidden': true,
    onPointerDown: (event) => handlePointerDown(event, edge),
    onPointerMove: handlePointerMove,
    onPointerUp: handlePointerUp,
    onPointerCancel: handlePointerUp,
  })

  return (
    <div
      className={`block ${duration < 45 ? 'block--compact' : ''} ${isResizing ? 'block--resizing' : ''}`}
      style={{
        '--offset': start - dayStart,
        '--duration': duration,
        '--cat': getCategoryColor(category?.color),
      }}
    >
      <div {...handleProps('start')} />
      <button
        type="button"
        className="block__body"
        onClick={() => onClick(block)}
        aria-label={`${block.title}, ${timeLabel}. Editar bloque`}
      >
        <span className="block__title">{block.title}</span>
        <span className="block__time">{timeLabel}</span>
      </button>
      <div {...handleProps('end')} />
    </div>
  )
}
