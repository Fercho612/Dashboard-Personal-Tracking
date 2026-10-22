// Funciones PURAS del calendario: reciben datos y devuelven resultados, sin tocar estado.
// Todas las horas se manejan como MINUTOS desde la medianoche (09:30 → 570).

export const SLOT_MINUTES = 15 // granularidad de la grilla y del redimensionado
export const MIN_DURATION = 15 // un bloque dura al menos esto

// Alto de una hora en la grilla. JS lo necesita para traducir píxeles ↔ minutos
// (clic en un hueco, redimensionado) y CSS lo recibe como variable.
export const HOUR_HEIGHT = 56
export const PX_PER_MINUTE = HOUR_HEIGHT / 60

// Orden de las columnas (lunes primero) usando la numeración de getDay(): 0 = domingo.
export const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0]
export const DAY_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
export const DAY_INITIALS = ['D', 'L', 'M', 'M', 'J', 'V', 'S']
export const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

// 570 → "09:30"
export function toTimeLabel(minutes) {
  const hours = String(Math.floor(minutes / 60)).padStart(2, '0')
  const mins = String(minutes % 60).padStart(2, '0')
  return `${hours}:${mins}`
}

// Lista de horarios entre `from` y `to` (inclusive) cada `step` minutos, para los <select>.
export function buildTimeOptions(from, to, step = SLOT_MINUTES) {
  const options = []
  for (let minutes = from; minutes <= to; minutes += step) options.push(minutes)
  return options
}

// Redondea al múltiplo de 15 minutos más cercano.
export function snapToSlot(minutes) {
  return Math.round(minutes / SLOT_MINUTES) * SLOT_MINUTES
}

// 150 → "2 h 30 min"
export function formatDuration(minutes) {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours === 0) return `${mins} min`
  return mins === 0 ? `${hours} h` : `${hours} h ${mins} min`
}

/**
 * Dos bloques se solapan si son del mismo día y cada uno empieza antes de que termine
 * el otro. Si uno termina justo cuando empieza el otro (10–11 y 11–12), NO se solapan.
 */
export function blocksOverlap(a, b) {
  return a.day === b.day && a.start < b.end && b.start < a.end
}

// Primer bloque con el que choca `candidate`, ignorando al propio bloque (caso edición).
export function findOverlap(candidate, blocks) {
  return blocks.find((block) => block.id !== candidate.id && blocksOverlap(candidate, block))
}

// Valida un bloque antes de guardarlo. Devuelve el mensaje de error o null si está bien.
export function validateBlock(candidate, blocks, settings) {
  if (!candidate.title.trim()) return 'El título es obligatorio.'
  if (!candidate.categoryId) return 'Elige una categoría.'
  if (candidate.start >= candidate.end) return 'La hora de fin debe ser posterior a la de inicio.'
  if (candidate.start < settings.dayStart || candidate.end > settings.dayEnd) {
    return `El bloque debe estar entre ${toTimeLabel(settings.dayStart)} y ${toTimeLabel(settings.dayEnd)}.`
  }
  const overlap = findOverlap(candidate, blocks)
  if (overlap) {
    return `Se superpone con «${overlap.title}» (${toTimeLabel(overlap.start)}–${toTimeLabel(overlap.end)}).`
  }
  return null
}

/**
 * Hasta dónde puede moverse un borde al redimensionar, sin invadir a los vecinos del
 * mismo día, sin salir de la franja visible y respetando la duración mínima.
 * edge = 'start' (manija de arriba) o 'end' (manija de abajo).
 */
export function getResizeBounds(block, edge, blocks, settings) {
  const sameDay = blocks.filter((other) => other.day === block.day && other.id !== block.id)

  if (edge === 'start') {
    // El vecino de arriba más cercano: el que termina más tarde sin pasar nuestro inicio.
    const previousEnds = sameDay.filter((other) => other.end <= block.start).map((other) => other.end)
    return { min: Math.max(settings.dayStart, ...previousEnds), max: block.end - MIN_DURATION }
  }

  // El vecino de abajo más cercano: el que empieza más temprano después de nuestro fin.
  const nextStarts = sameDay.filter((other) => other.start >= block.end).map((other) => other.start)
  return { min: block.start + MIN_DURATION, max: Math.min(settings.dayEnd, ...nextStarts) }
}

// Nuevo { start, end } al arrastrar un borde hasta `minutes`: ajustado a 15' y a los límites.
export function resizeBlock(block, edge, minutes, blocks, settings) {
  const { min, max } = getResizeBounds(block, edge, blocks, settings)
  const value = Math.min(max, Math.max(min, snapToSlot(minutes)))
  return edge === 'start' ? { start: value, end: block.end } : { start: block.start, end: value }
}

// Bloques que quedarían fuera de una franja horaria [dayStart, dayEnd].
export function getBlocksOutsideRange(blocks, dayStart, dayEnd) {
  return blocks.filter((block) => block.start < dayStart || block.end > dayEnd)
}

// Valida una nueva franja horaria. Devuelve el mensaje de error o null.
export function validateRange(dayStart, dayEnd, blocks) {
  if (dayEnd <= dayStart) return 'La hora de fin debe ser posterior a la de inicio.'
  if (dayEnd - dayStart < 60) return 'La franja debe durar al menos 1 hora.'
  const outside = getBlocksOutsideRange(blocks, dayStart, dayEnd)
  if (outside.length > 0) {
    const list = outside
      .map((block) => `«${block.title}» (${DAY_SHORT[block.day]} ${toTimeLabel(block.start)}–${toTimeLabel(block.end)})`)
      .join(', ')
    return `Quedarían fuera: ${list}.`
  }
  return null
}

// Valida el nombre de una categoría (obligatorio y sin repetir, ignorando mayúsculas).
export function validateCategoryName(name, categories, editingId = null) {
  const normalized = name.trim().toLowerCase()
  if (!normalized) return 'El nombre es obligatorio.'
  const duplicated = categories.some(
    (category) => category.id !== editingId && category.name.trim().toLowerCase() === normalized,
  )
  return duplicated ? 'Ya existe una categoría con ese nombre.' : null
}

// Minutos planificados en total y por categoría (en el orden de `categories`).
export function getMinutesByCategory(blocks, categories) {
  const byCategory = categories.map((category) => ({
    category,
    minutes: blocks
      .filter((block) => block.categoryId === category.id)
      .reduce((sum, block) => sum + (block.end - block.start), 0),
  }))
  const total = blocks.reduce((sum, block) => sum + (block.end - block.start), 0)
  return { total, byCategory }
}

// --- Hábitos asignados a un bloque (spec 04) ---

/**
 * Hábitos asignados a un bloque, en el orden en que se asignaron.
 * Si un id ya no corresponde a ningún hábito (se borró), se ignora: no se muestra
 * y no rompe nada.
 */
export function getAssignedHabits(habitIds, habits) {
  return habitIds
    .map((habitId) => habits.find((habit) => habit.id === habitId))
    .filter((habit) => habit !== undefined)
}

// Hábitos que todavía se pueden agregar al bloque, en el orden de la lista de hábitos.
export function getAssignableHabits(habitIds, habits) {
  return habits.filter((habit) => !habitIds.includes(habit.id))
}

// En cuántos bloques está asignado un hábito (para avisar antes de borrarlo).
export function countBlocksWithHabit(blocks, habitId) {
  return blocks.filter((block) => block.habitIds.includes(habitId)).length
}

/**
 * Quita un hábito de todos los bloques. Devuelve un array nuevo (inmutabilidad):
 * los bloques que no lo tenían se devuelven tal cual, sin copiarlos.
 */
export function removeHabitFromBlocks(blocks, habitId) {
  return blocks.map((block) =>
    block.habitIds.includes(habitId)
      ? { ...block, habitIds: block.habitIds.filter((id) => id !== habitId) }
      : block,
  )
}

/**
 * Asegura que cada bloque guardado tenga `habitIds` como lista. Un dato viejo, incompleto
 * o editado a mano no debe romper la app. Los bloques correctos se devuelven tal cual.
 */
export function normalizeHabitIds(blocks) {
  return blocks.map((block) => (Array.isArray(block.habitIds) ? block : { ...block, habitIds: [] }))
}

/**
 * Migración del formato guardado v1 → v2: en v1 los bloques no tenían hábitos,
 * así que cada uno empieza con `habitIds` vacío. Categorías y ajustes no cambian.
 */
export function migrateScheduleFromV1(saved) {
  return {
    ...saved,
    blocks: saved.blocks.map((block) => ({ ...block, habitIds: [] })),
  }
}
