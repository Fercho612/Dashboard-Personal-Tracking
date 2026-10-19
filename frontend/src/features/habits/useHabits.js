import { useEffect, useState } from 'react'

const STORAGE_KEY = 'dashboard.habits.v1'
const EMPTY_STATE = { habits: [], completions: {} }

// Lee el estado guardado. Si no hay nada o el JSON está corrupto, arranca vacío.
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY_STATE
    const parsed = JSON.parse(raw)
    return {
      habits: Array.isArray(parsed.habits) ? parsed.habits : [],
      completions: parsed.completions ?? {},
    }
  } catch {
    return EMPTY_STATE
  }
}

/**
 * Hook personalizado: concentra el estado de hábitos y su persistencia.
 * Los componentes solo llaman a las acciones; no saben que existe localStorage.
 * Cuando llegue el backend, solo cambia este archivo.
 */
export function useHabits() {
  // Inicialización "perezosa": la función se ejecuta una sola vez, en el primer render.
  const [state, setState] = useState(loadState)

  // useEffect se ejecuta después de cada render en el que `state` cambió:
  // es el lugar indicado para efectos secundarios como escribir en localStorage.
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  // Todas las actualizaciones crean objetos nuevos (inmutabilidad): React compara
  // referencias para saber si algo cambió y debe volver a renderizar.

  function addHabit({ name, description, frequency }, createdAt) {
    const habit = { id: crypto.randomUUID(), name, description, frequency, createdAt }
    setState((prev) => ({ ...prev, habits: [...prev.habits, habit] }))
  }

  function updateHabit(id, changes) {
    setState((prev) => ({
      ...prev,
      habits: prev.habits.map((habit) => (habit.id === id ? { ...habit, ...changes } : habit)),
    }))
  }

  function deleteHabit(id) {
    setState((prev) => {
      // Sacamos la entrada `id` de completions y nos quedamos con el resto.
      const { [id]: _removed, ...remainingCompletions } = prev.completions
      return {
        habits: prev.habits.filter((habit) => habit.id !== id),
        completions: remainingCompletions,
      }
    })
  }

  // Marca el día si no estaba hecho, o lo desmarca si ya estaba.
  function toggleCompletion(habitId, dateKey) {
    setState((prev) => {
      const days = prev.completions[habitId] ?? []
      const nextDays = days.includes(dateKey)
        ? days.filter((day) => day !== dateKey)
        : [...days, dateKey].sort()
      return { ...prev, completions: { ...prev.completions, [habitId]: nextDays } }
    })
  }

  return {
    habits: state.habits,
    completions: state.completions,
    addHabit,
    updateHabit,
    deleteHabit,
    toggleCompletion,
  }
}
