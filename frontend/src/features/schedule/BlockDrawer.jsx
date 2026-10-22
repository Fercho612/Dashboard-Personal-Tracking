import { useEffect, useRef, useState } from 'react'
import { isScheduledOnWeekday } from '../habits/habitStats.js'
import { getCategoryColor } from './palette.js'
import {
  DAY_INITIALS,
  DAY_NAMES,
  WEEK_ORDER,
  buildTimeOptions,
  getAssignableHabits,
  getAssignedHabits,
  toTimeLabel,
  validateBlock,
} from './scheduleUtils.js'

const TITLE_MAX = 60

/**
 * Panel lateral para crear o editar un bloque.
 * - `block`: el bloque a editar, o null para crear uno nuevo.
 * - `draft`: valores iniciales al crear ({ day, start, end }), p. ej. desde un clic en la grilla.
 * - `habits`: los hábitos existentes (solo lectura), para asignarlos al bloque.
 * - `onGoToHabits`: lleva a la sección Hábitos (cuando todavía no hay ninguno).
 * Es el mismo <dialog> nativo que el modal de hábitos, con estilo de drawer.
 */
export default function BlockDrawer({
  block,
  draft,
  blocks,
  categories,
  habits,
  settings,
  onSave,
  onDelete,
  onClose,
  onGoToHabits,
}) {
  const isEditing = block !== null
  const initial = block ?? draft
  const dialogRef = useRef(null)
  const titleRef = useRef(null)
  const addHabitButtonRef = useRef(null)
  const habitPickerRef = useRef(null)

  const [title, setTitle] = useState(block?.title ?? '')
  const [day, setDay] = useState(initial.day)
  const [start, setStart] = useState(initial.start)
  const [end, setEnd] = useState(initial.end)
  const [categoryId, setCategoryId] = useState(block?.categoryId ?? categories[0]?.id ?? '')
  // Hábitos asignados: son estado local del panel, así que se guardan junto con el bloque
  // al pulsar «Guardar» y se descartan al cancelar (RF-5).
  const [habitIds, setHabitIds] = useState(block?.habitIds ?? [])
  const [isPickingHabit, setIsPickingHabit] = useState(false)
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog.open) dialog.showModal()
    // showModal() enfoca el primer elemento (el botón ×); preferimos empezar en el título.
    titleRef.current.focus()
    return () => dialog.close()
  }, [])

  // El inicio puede ir hasta 15' antes del cierre de la franja; el fin, desde 15' después de la apertura.
  const startOptions = buildTimeOptions(settings.dayStart, settings.dayEnd - 15)
  const endOptions = buildTimeOptions(settings.dayStart + 15, settings.dayEnd)

  // Al abrir las opciones de hábitos, el foco pasa a la primera para poder elegir con el teclado.
  useEffect(() => {
    if (isPickingHabit) habitPickerRef.current.querySelector('button').focus()
  }, [isPickingHabit])

  const assignedHabits = getAssignedHabits(habitIds, habits)
  const assignableHabits = getAssignableHabits(habitIds, habits)

  // Se agrega de a un hábito, al final de la lista: el orden es el de asignación (RF-3).
  function addHabit(habitId) {
    setHabitIds((current) => [...current, habitId])
    setIsPickingHabit(false)
    addHabitButtonRef.current.focus() // el foco vuelve al botón «+», no se pierde al cerrar las opciones
  }

  function removeHabit(habitId) {
    setHabitIds((current) => current.filter((id) => id !== habitId))
  }

  function handleSubmit(event) {
    event.preventDefault()
    const candidate = { id: block?.id, title: title.trim(), day, start, end, categoryId }
    const validationError = validateBlock(candidate, blocks, settings)
    if (validationError) {
      setError(validationError)
      return
    }
    onSave({ title: candidate.title, day, start, end, categoryId, habitIds })
  }

  return (
    <dialog
      ref={dialogRef}
      className="modal drawer"
      aria-labelledby="block-drawer-title"
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose()
      }}
    >
      <form className="modal__body drawer__body" onSubmit={handleSubmit} noValidate>
        <header className="drawer__header">
          <h2 id="block-drawer-title" className="card__title">
            {isEditing ? 'Editar bloque' : 'Nuevo bloque'}
          </h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Cerrar">
            ×
          </button>
        </header>

        <label className="field">
          <span className="field__label">Título del bloque</span>
          <input
            ref={titleRef}
            className="input"
            value={title}
            maxLength={TITLE_MAX}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Ej. Deep work: informe mensual"
          />
        </label>

        <fieldset className="field">
          <legend className="field__label">Día de la semana</legend>
          <div className="day-picker">
            {WEEK_ORDER.map((value) => (
              <button
                key={value}
                type="button"
                className={`day-picker__day ${day === value ? 'is-selected' : ''}`}
                aria-pressed={day === value}
                aria-label={DAY_NAMES[value]}
                title={DAY_NAMES[value]}
                onClick={() => setDay(value)}
              >
                {DAY_INITIALS[value]}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="field-row">
          <label className="field">
            <span className="field__label">Hora de inicio</span>
            {/* Los <select> reciben strings: convertimos a número con Number() */}
            <select className="input" value={start} onChange={(event) => setStart(Number(event.target.value))}>
              {startOptions.map((minutes) => (
                <option key={minutes} value={minutes}>
                  {toTimeLabel(minutes)}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span className="field__label">Hora de fin</span>
            <select className="input" value={end} onChange={(event) => setEnd(Number(event.target.value))}>
              {endOptions.map((minutes) => (
                <option key={minutes} value={minutes}>
                  {toTimeLabel(minutes)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <fieldset className="field">
          <legend className="field__label">Categoría</legend>
          {categories.length === 0 ? (
            <p className="field__hint">Todavía no hay categorías. Crea una desde «Gestionar categorías».</p>
          ) : (
            <div className="category-options">
              {categories.map((category) => (
                <label
                  key={category.id}
                  className={`category-option ${categoryId === category.id ? 'is-active' : ''}`}
                  style={{ '--cat': getCategoryColor(category.color) }}
                >
                  <input
                    type="radio"
                    name="category"
                    value={category.id}
                    checked={categoryId === category.id}
                    onChange={() => setCategoryId(category.id)}
                  />
                  <span className="category-dot" aria-hidden="true" />
                  {category.name}
                </label>
              ))}
            </div>
          )}
        </fieldset>

        <fieldset className="field">
          <legend className="field__label">Hábitos</legend>
          {assignedHabits.length > 0 && (
            <ul className="habit-list">
              {assignedHabits.map((habit) => (
                <li key={habit.id} className="habit-list__item">
                  <span className="habit-list__name">{habit.name}</span>
                  {/* Aviso, no error: se puede guardar igual. Usa `day`, así que se recalcula al cambiar el día. */}
                  {!isScheduledOnWeekday(habit, day) && (
                    <span className="habit-list__warning">No le toca este día</span>
                  )}
                  <button
                    type="button"
                    className="icon-btn"
                    aria-label={`Quitar ${habit.name} del bloque`}
                    title="Quitar del bloque"
                    onClick={() => removeHabit(habit.id)}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}

          {habits.length === 0 && (
            <div className="habit-empty">
              <p className="field__hint">Todavía no tienes hábitos.</p>
              <button type="button" className="btn btn--ghost btn--small" onClick={onGoToHabits}>
                Ir a Hábitos
              </button>
            </div>
          )}

          {habits.length > 0 && (
            <div className="habit-add">
              <span className="habit-add__label">Agregar hábito:</span>
              <button
                ref={addHabitButtonRef}
                type="button"
                className="btn btn--success habit-add__button"
                aria-label="Agregar hábito"
                title="Agregar hábito"
                disabled={assignableHabits.length === 0}
                onClick={() => setIsPickingHabit(true)}
              >
                +
              </button>
              {assignableHabits.length === 0 && (
                <span className="field__hint">Ya agregaste todos tus hábitos.</span>
              )}
            </div>
          )}

          {isPickingHabit && (
            <div ref={habitPickerRef} className="habit-picker" role="group" aria-label="Elige un hábito">
              {assignableHabits.map((habit) => (
                <button key={habit.id} type="button" className="chip" onClick={() => addHabit(habit.id)}>
                  {habit.name}
                </button>
              ))}
              <button type="button" className="btn btn--ghost btn--small" onClick={() => setIsPickingHabit(false)}>
                Cancelar
              </button>
            </div>
          )}
        </fieldset>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        <div className="modal__actions drawer__actions">
          {isEditing && !isConfirmingDelete && (
            <button type="button" className="btn btn--danger" onClick={() => setIsConfirmingDelete(true)}>
              Borrar
            </button>
          )}
          {isConfirmingDelete && (
            <div className="confirm-delete">
              <span>¿Borrar este bloque?</span>
              <button type="button" className="btn btn--danger" onClick={() => onDelete(block.id)}>
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
                {isEditing ? 'Guardar cambios' : 'Guardar bloque'}
              </button>
            </div>
          )}
        </div>
      </form>
    </dialog>
  )
}
