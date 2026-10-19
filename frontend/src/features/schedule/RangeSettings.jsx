import { useEffect, useRef, useState } from 'react'
import { toTimeLabel, validateRange } from './scheduleUtils.js'

// Horas enteras posibles: 00:00 … 24:00 (en minutos).
const HOURS = Array.from({ length: 25 }, (_, hour) => hour * 60)

/**
 * Diálogo para elegir la franja horaria visible de la grilla.
 * Si la nueva franja deja bloques afuera, no se aplica: no recortamos datos en silencio.
 */
export default function RangeSettings({ settings, blocks, onSave, onClose }) {
  const dialogRef = useRef(null)
  const [dayStart, setDayStart] = useState(settings.dayStart)
  const [dayEnd, setDayEnd] = useState(settings.dayEnd)
  const [error, setError] = useState('')

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog.open) dialog.showModal()
    return () => dialog.close()
  }, [])

  function handleSubmit(event) {
    event.preventDefault()
    const validationError = validateRange(dayStart, dayEnd, blocks)
    if (validationError) {
      setError(validationError)
      return
    }
    onSave({ dayStart, dayEnd })
  }

  return (
    <dialog
      ref={dialogRef}
      className="modal"
      aria-labelledby="range-settings-title"
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose()
      }}
    >
      <form className="modal__body" onSubmit={handleSubmit} noValidate>
        <h2 id="range-settings-title" className="card__title">
          Franja horaria
        </h2>
        <p className="field__hint">Las horas que muestra el calendario. Los bloques tienen que quedar dentro.</p>

        <div className="field-row">
          <label className="field">
            <span className="field__label">Desde</span>
            <select className="input" value={dayStart} onChange={(event) => setDayStart(Number(event.target.value))}>
              {HOURS.slice(0, -1).map((minutes) => (
                <option key={minutes} value={minutes}>
                  {toTimeLabel(minutes)}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span className="field__label">Hasta</span>
            <select className="input" value={dayEnd} onChange={(event) => setDayEnd(Number(event.target.value))}>
              {HOURS.slice(1).map((minutes) => (
                <option key={minutes} value={minutes}>
                  {toTimeLabel(minutes)}
                </option>
              ))}
            </select>
          </label>
        </div>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        <div className="modal__actions">
          <div className="modal__actions-main">
            <button type="button" className="btn btn--ghost" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn--primary">
              Aplicar
            </button>
          </div>
        </div>
      </form>
    </dialog>
  )
}
