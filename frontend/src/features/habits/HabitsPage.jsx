import { useState } from 'react'
import { addDays, startOfWeek, toDateKey } from '../../lib/dates.js'
import { useHabits } from './useHabits.js'
import WeeklyMatrix from './WeeklyMatrix.jsx'
import HabitFormModal from './HabitFormModal.jsx'
import TodaySummary from './TodaySummary.jsx'
import './habits.css'

export default function HabitsPage() {
  const { habits, completions, addHabit, updateHabit, deleteHabit, reorderHabits, toggleCompletion } =
    useHabits()

  const today = new Date()
  // Estado local de la vista: qué semana se está mirando (su lunes).
  const [weekStart, setWeekStart] = useState(() => startOfWeek(today))
  // null = modal cerrado · { habit: null } = crear · { habit } = editar
  const [modal, setModal] = useState(null)

  // Texto para el lector de pantalla tras mover un hábito, y aviso si no se pudo guardar.
  const [announcement, setAnnouncement] = useState('')
  const [reorderFailed, setReorderFailed] = useState(false)

  const openCreateModal = () => setModal({ habit: null })
  const closeModal = () => setModal(null)

  function handleSave(data) {
    if (modal.habit) {
      updateHabit(modal.habit.id, data)
    } else {
      addHabit(data, toDateKey(today))
    }
    closeModal()
  }

  function handleDelete(id) {
    deleteHabit(id)
    closeModal()
  }

  function handleMove(from, to) {
    const saved = reorderHabits(from, to)
    setReorderFailed(!saved)
    setAnnouncement(saved ? `${habits[from].name}, posición ${to + 1} de ${habits.length}` : '')
  }

  return (
    <div className="habits-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Ritmo consciente • Hoy</p>
          <h1 className="page-heading__title">Registro diario de hábitos</h1>
          <p className="page-heading__subtitle">
            Mantén la coherencia y armoniza tu energía a lo largo de las jornadas.
          </p>
        </div>
        {habits.length > 0 && (
          <button type="button" className="btn btn--primary" onClick={openCreateModal}>
            + Añadir nuevo hábito
          </button>
        )}
      </div>

      {habits.length === 0 ? (
        <section className="card empty-state">
          <h2 className="card__title">Todavía no tienes hábitos</h2>
          <p>Crea tu primer hábito para empezar a registrar tu constancia.</p>
          <button type="button" className="btn btn--primary" onClick={openCreateModal}>
            + Crear mi primer hábito
          </button>
        </section>
      ) : (
        // <> … </> es un Fragment: agrupa elementos sin agregar un <div> extra al DOM.
        <>
          <TodaySummary habits={habits} completions={completions} today={today} />
          <p className="visually-hidden" aria-live="polite">{announcement}</p>
          {reorderFailed && (
            <p className="form-error reorder-error" role="alert">
              No se pudo guardar el nuevo orden. Inténtalo de nuevo.
            </p>
          )}
          <WeeklyMatrix
            habits={habits}
            completions={completions}
            weekStart={weekStart}
            today={today}
            onToggle={toggleCompletion}
            onPrevWeek={() => setWeekStart((current) => addDays(current, -7))}
            onNextWeek={() => setWeekStart((current) => addDays(current, 7))}
            onGoToToday={() => setWeekStart(startOfWeek(today))}
            onMove={handleMove}
            onEdit={(habit) => setModal({ habit })}
          />
        </>
      )}

      {/* Renderizado condicional: el modal solo existe en el DOM mientras está abierto */}
      {modal && (
        <HabitFormModal
          habit={modal.habit}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={closeModal}
        />
      )}
    </div>
  )
}
