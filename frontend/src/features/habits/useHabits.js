import { useEffect, useRef, useState } from 'react'
import { moveItem } from './habitStats.js'

const STORAGE_KEY = 'dashboard.habits.v1'
const EMPTY_STATE = { habits: [], completions: {} }

// Lee el estado guardado. Si no hay nada o el JSON está corrupto, arranca vacío.
export function loadState() {
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

  // Solo se escribe después de la primera acción del usuario: si el JSON guardado
  // estaba corrupto, montar la app no lo pisa con el estado vacío.
  const hasUserChanged = useRef(false)

  function update(updater) {
    hasUserChanged.current = true
    setState(updater)
  }

  // useEffect se ejecuta después de cada render en el que `state` cambió:
  // es el lugar indicado para efectos secundarios como escribir en localStorage.
  useEffect(() => {
    if (!hasUserChanged.current) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  // Todas las actualizaciones crean objetos nuevos (inmutabilidad): React compara
  // referencias para saber si algo cambió y debe volver a renderizar.

  function addHabit({ name, description, frequency }, createdAt) {
    const habit = { id: crypto.randomUUID(), name, description, frequency, createdAt }
    update((prev) => ({ ...prev, habits: [...prev.habits, habit] }))
  }

  function updateHabit(id, changes) {
    update((prev) => ({
      ...prev,
      habits: prev.habits.map((habit) => (habit.id === id ? { ...habit, ...changes } : habit)),
    }))
  }

  function deleteHabit(id) {
    update((prev) => {
      // Sacamos la entrada `id` de completions y nos quedamos con el resto.
      const { [id]: _removed, ...remainingCompletions } = prev.completions
      return {
        habits: prev.habits.filter((habit) => habit.id !== id),
        completions: remainingCompletions,
      }
    })
  }

  // Mueve un hábito de la posición `from` a `to`. El orden de la lista guardada es el
  // orden que se ve, así que no hay campo nuevo. Se guarda ANTES de actualizar el estado:
  // si falla la escritura, el estado queda como estaba y se devuelve false para avisar.
  function reorderHabits(from, to) {
    const habits = moveItem(state.habits, from, to)
    if (habits === state.habits) return true // nada que mover
    const next = { ...state, habits }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      return false
    }
    update(() => next)
    return true
  }

  // Marca el día si no estaba hecho, o lo desmarca si ya estaba.
  function toggleCompletion(habitId, dateKey) {
    update((prev) => {
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
    reorderHabits,
    toggleCompletion,
  }
}
