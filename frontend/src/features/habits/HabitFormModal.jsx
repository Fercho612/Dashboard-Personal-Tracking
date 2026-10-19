import { useEffect, useRef, useState } from 'react'

// Orden visual lunes → domingo; `value` es el número de getDay() (0 = domingo).
const WEEK_DAYS = [
  { value: 1, label: 'L', name: 'Lunes' },
  { value: 2, label: 'M', name: 'Martes' },
  { value: 3, label: 'M', name: 'Miércoles' },
  { value: 4, label: 'J', name: 'Jueves' },
  { value: 5, label: 'V', name: 'Viernes' },
  { value: 6, label: 'S', name: 'Sábado' },
  { value: 0, label: 'D', name: 'Domingo' },
]

const NAME_MAX = 60
const DESCRIPTION_MAX = 120

/**
 * Modal para crear (habit = null) o editar un hábito.
 * Usa el elemento nativo <dialog>: con showModal() el navegador ya resuelve el fondo
 * oscuro, que el foco no se escape del modal y el cierre con la tecla Esc.
 */
export default function HabitFormModal({ habit, onSave, onDelete, onClose }) {
  const isEditing = habit !== null
  const dialogRef = useRef(null)

  // Formulario "controlado": React es la única fuente de verdad de cada input.
  const [name, setName] = useState(habit?.name ?? '')
  const [description, setDescription] = useState(habit?.description ?? '')
  const [frequencyType, setFrequencyType] = useState(habit?.frequency.type ?? 'daily')
  const [selectedDays, setSelectedDays] = useState(
    habit?.frequency.type === 'weekdays' ? habit.frequency.days : [1, 2, 3, 4, 5],
  )
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
  const [error, setError] = useState('')

  // Al montarse el componente abrimos el diálogo; al desmontarse lo cerramos.
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog.open) dialog.showModal()
    return () => dialog.close()
  }, [])

  function toggleDay(value) {
    setSelectedDays((current) =>
      current.includes(value) ? current.filter((day) => day !== value) : [...current, value],
    )
  }

  function handleSubmit(event) {
    event.preventDefault() // evita que el form recargue la página

    const trimmedName = name.trim()
    if (!trimmedName) {
      setError('El nombre es obligatorio.')
      return
    }
    if (frequencyType === 'weekdays' && selectedDays.length === 0) {
      setError('Elige al menos un día de la semana.')
      return
    }

    const frequency =
      frequencyType === 'daily'
        ? { type: 'daily' }
        : { type: 'weekdays', days: [...selectedDays].sort((a, b) => a - b) }

    onSave({ name: trimmedName, description: description.trim(), frequency })
  }

  return (
    <dialog
      ref={dialogRef}
      className="modal"
      aria-labelledby="habit-form-title"
      // "cancel" lo dispara el navegador al apretar Esc.
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      // Un clic justo sobre el <dialog> (no sobre su contenido) es un clic en el fondo.
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose()
      }}
    >
      <form className="modal__body" onSubmit={handleSubmit} noValidate>
        <h2 id="habit-form-title" className="card__title">
          {isEditing ? 'Editar hábito' : 'Nuevo hábito'}
        </h2>

        <label className="field">
          <span className="field__label">Nombre</span>
          <input
            className="input"
            value={name}
            maxLength={NAME_MAX}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ej. Meditación 10 min"
            autoFocus
          />
        </label>

        <label className="field">
          <span className="field__label">
            Descripción <span className="field__hint">(opcional)</span>
          </span>
          <input
            className="input"
            value={description}
            maxLength={DESCRIPTION_MAX}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Ej. Respiración guiada antes de desayunar"
          />
        </label>

        <fieldset className="field">
          <legend className="field__label">Frecuencia</legend>
          <div className="segmented">
            <label className={`segmented__option ${frequencyType === 'daily' ? 'is-active' : ''}`}>
              <input
                type="radio"
                name="frequency"
                value="daily"
                checked={frequencyType === 'daily'}
                onChange={() => setFrequencyType('daily')}
              />
              Todos los días
            </label>
            <label className={`segmented__option ${frequencyType === 'weekdays' ? 'is-active' : ''}`}>
              <input
                type="radio"
                name="frequency"
                value="weekdays"
                checked={frequencyType === 'weekdays'}
                onChange={() => setFrequencyType('weekdays')}
              />
              Días específicos
            </label>
          </div>

          {frequencyType === 'weekdays' && (
            <div className="day-picker">
              {WEEK_DAYS.map((day) => (
                <button
                  key={day.value}
                  type="button"
                  className={`day-picker__day ${selectedDays.includes(day.value) ? 'is-selected' : ''}`}
                  aria-pressed={selectedDays.includes(day.value)}
                  aria-label={day.name}
                  title={day.name}
                  onClick={() => toggleDay(day.value)}
                >
                  {day.label}
                </button>
              ))}
            </div>
          )}
        </fieldset>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        <div className="modal__actions">
          {isEditing && !isConfirmingDelete && (
            <button type="button" className="btn btn--danger" onClick={() => setIsConfirmingDelete(true)}>
              Borrar
            </button>
          )}
          {isConfirmingDelete && (
            <div className="confirm-delete">
              <span>¿Borrar el hábito y todo su historial?</span>
              <button type="button" className="btn btn--danger" onClick={() => onDelete(habit.id)}>
                Sí, borrar
              </button>
              <button type="button" className="btn btn--ghost" onClick={() => setIsConfirmingDelete(false)}>
                No
              </button>
            </div>
          )}

          {!isConfirmingDelete && (
            <div className="modal__actions-main">
              <button type="button" className="btn btn--ghost" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="btn btn--primary">
                {isEditing ? 'Guardar cambios' : 'Crear hábito'}
              </button>
            </div>
          )}
        </div>
      </form>
    </dialog>
  )
}
