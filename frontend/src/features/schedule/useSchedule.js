import { useEffect, useRef, useState } from 'react'

const STORAGE_KEY = 'dashboard.schedule.v1'

// Estado inicial la primera vez que se abre el calendario: 4 categorías de ejemplo
// (editables y borrables como cualquier otra) y la franja 07:00–22:00.
function createInitialState() {
  return {
    blocks: [],
    categories: [
      { id: crypto.randomUUID(), name: 'Trabajo profundo', color: 'indigo' },
      { id: crypto.randomUUID(), name: 'Salud', color: 'emerald' },
      { id: crypto.randomUUID(), name: 'Reuniones', color: 'amber' },
      { id: crypto.randomUUID(), name: 'Personal', color: 'coral' },
    ],
    settings: { dayStart: 7 * 60, dayEnd: 22 * 60 },
  }
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return createInitialState()
    const parsed = JSON.parse(raw)
    const initial = createInitialState()
    return {
      blocks: Array.isArray(parsed.blocks) ? parsed.blocks : [],
      categories: Array.isArray(parsed.categories) ? parsed.categories : initial.categories,
      settings: parsed.settings ?? initial.settings,
    }
  } catch {
    return createInitialState()
  }
}

/**
 * Hook del calendario: estado + persistencia, igual que useHabits.
 * Las validaciones (solapamiento, franja, nombres) las hacen los componentes con las
 * funciones puras de scheduleUtils.js antes de llamar a estas acciones.
 */
export function useSchedule() {
  const [state, setState] = useState(loadState)

  // Solo se escribe después de la primera acción del usuario: si el JSON guardado
  // estaba corrupto, abrir el calendario no lo pisa con el estado inicial (constitución 5).
  const hasUserChanged = useRef(false)

  // Toda acción que modifique el estado debe pasar por aquí, no por setState directo.
  function update(updater) {
    hasUserChanged.current = true
    setState(updater)
  }

  useEffect(() => {
    if (!hasUserChanged.current) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  // --- Bloques ---

  function addBlock(data) {
    const block = { id: crypto.randomUUID(), ...data }
    update((prev) => ({ ...prev, blocks: [...prev.blocks, block] }))
  }

  function updateBlock(id, changes) {
    update((prev) => ({
      ...prev,
      blocks: prev.blocks.map((block) => (block.id === id ? { ...block, ...changes } : block)),
    }))
  }

  function deleteBlock(id) {
    update((prev) => ({ ...prev, blocks: prev.blocks.filter((block) => block.id !== id) }))
  }

  // --- Categorías ---

  function addCategory(data) {
    const category = { id: crypto.randomUUID(), ...data }
    update((prev) => ({ ...prev, categories: [...prev.categories, category] }))
  }

  function updateCategory(id, changes) {
    update((prev) => ({
      ...prev,
      categories: prev.categories.map((category) =>
        category.id === id ? { ...category, ...changes } : category,
      ),
    }))
  }

  function deleteCategory(id) {
    update((prev) => ({
      ...prev,
      categories: prev.categories.filter((category) => category.id !== id),
    }))
  }

  // --- Ajustes ---

  function updateSettings(changes) {
    update((prev) => ({ ...prev, settings: { ...prev.settings, ...changes } }))
  }

  return {
    ...state,
    addBlock,
    updateBlock,
    deleteBlock,
    addCategory,
    updateCategory,
    deleteCategory,
    updateSettings,
  }
}
