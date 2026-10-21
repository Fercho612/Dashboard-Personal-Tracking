import { addDays, getWeekDays, startOfWeek, toDateKey } from '../../lib/dates.js'
import { getScheduledHabits } from '../habits/habitStats.js'

// Funciones PURAS de cálculo de estadísticas: reciben datos y `today`, y devuelven un
// resultado. No tocan estado ni localStorage, así se testean con fechas fijas.

/**
 * Rango de fechas (inclusive) que cubre cada período, siempre hasta hoy:
 * - week: del lunes de esta semana hasta hoy.
 * - month: del día 1 del mes hasta hoy.
 * - 90days: hoy y los 89 días anteriores.
 */
export function getPeriodRange(periodId, today) {
  if (periodId === 'week') return { start: startOfWeek(today), end: today }
  if (periodId === 'month') {
    return { start: new Date(today.getFullYear(), today.getMonth(), 1), end: today }
  }
  return { start: addDays(today, -89), end: today }
}

/**
 * Tramo equivalente del período anterior, para comparar "manzanas con manzanas":
 * - week: del lunes al mismo día de la semana, pero de la semana pasada.
 * - month: del día 1 al mismo número de día del mes pasado (si ese mes es más corto,
 *   se corta en su último día).
 * - 90days: los 90 días inmediatamente anteriores.
 */
export function getPreviousRange(periodId, today) {
  const current = getPeriodRange(periodId, today)

  if (periodId === 'week') {
    return { start: addDays(current.start, -7), end: addDays(current.end, -7) }
  }

  if (periodId === 'month') {
    const start = new Date(today.getFullYear(), today.getMonth() - 1, 1)
    // El día 0 del mes siguiente es el último día de este mes: da la cantidad de días.
    const daysInPreviousMonth = new Date(today.getFullYear(), today.getMonth(), 0).getDate()
    const endDay = Math.min(today.getDate(), daysInPreviousMonth)
    return { start, end: addDays(start, endDay - 1) }
  }

  return { start: addDays(current.start, -90), end: addDays(current.start, -1) }
}

/**
 * Oportunidades de un día: pares (hábito, día) que le tocaban al usuario ese día.
 * - Los días futuros no tienen oportunidades.
 * - Hoy solo cuenta lo que ya está hecho: el día en curso todavía no "terminó",
 *   así que un hábito pendiente no baja la tasa (misma regla que la consistencia de Hábitos).
 * - Un registro en un día que no le tocaba al hábito se ignora: `getScheduledHabits`
 *   ya filtra por frecuencia y por fecha de inicio.
 */
export function getDayStats(habits, completions, date, today) {
  const dateKey = toDateKey(date)
  if (dateKey > toDateKey(today)) return { done: 0, total: 0 }

  const scheduled = getScheduledHabits(habits, completions, date)
  const done = scheduled.filter((habit) => (completions[habit.id] ?? []).includes(dateKey)).length
  const total = dateKey === toDateKey(today) ? done : scheduled.length
  return { done, total }
}

/**
 * Suma las oportunidades de todos los días de un rango (inclusive).
 * `rate` es el % redondeado, o null si no hubo ninguna oportunidad: así la interfaz
 * puede mostrar "—" en vez de un 0 % engañoso.
 */
export function getRangeStats(habits, completions, range, today) {
  let done = 0
  let total = 0
  const endKey = toDateKey(range.end)

  for (let date = range.start; toDateKey(date) <= endKey; date = addDays(date, 1)) {
    const day = getDayStats(habits, completions, date, today)
    done += day.done
    total += day.total
  }

  return { done, total, rate: total === 0 ? null : Math.round((done / total) * 100) }
}

/**
 * Días perfectos del rango: días con al menos una oportunidad en los que se cumplieron todas.
 * `longestStreak` es la mayor cantidad de días perfectos consecutivos DENTRO del rango:
 * una racha que empezó antes del rango solo suma los días que caen adentro.
 * Los días sin oportunidades (futuros, hoy pendiente, nada programado) se saltean:
 * ni suman ni cortan la racha.
 */
export function getPerfectDays(habits, completions, range, today) {
  let perfectDays = 0
  let activeDays = 0
  let longestStreak = 0
  let currentStreak = 0
  const endKey = toDateKey(range.end)

  for (let date = range.start; toDateKey(date) <= endKey; date = addDays(date, 1)) {
    const { done, total } = getDayStats(habits, completions, date, today)
    if (total === 0) continue

    activeDays++
    if (done === total) {
      perfectDays++
      currentStreak++
      longestStreak = Math.max(longestStreak, currentStreak)
    } else {
      currentStreak = 0
    }
  }

  return { perfectDays, activeDays, longestStreak }
}

// --- Matriz de constancia ----------------------------------------------------

const MATRIX_WEEKS = 17
const MONTH_NAMES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
const DAY_NAMES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

/**
 * Nivel de color de un día según su tasa (ya redondeada):
 * null = sin oportunidades, 0 = 0 %, 1 = 1–33 %, 2 = 34–66 %, 3 = 67–99 %, 4 = 100 %.
 */
export function getRateLevel(rate) {
  if (rate === null) return null
  if (rate === 0) return 0
  if (rate <= 33) return 1
  if (rate <= 66) return 2
  if (rate < 100) return 3
  return 4
}

/**
 * Las últimas 17 semanas (la última es la actual) como columnas de 7 días, lunes → domingo.
 * Cada día trae sus hechos/total, su nivel y si es futuro, listo para dibujarlo.
 */
export function getMatrixWeeks(habits, completions, today) {
  const firstMonday = addDays(startOfWeek(today), -7 * (MATRIX_WEEKS - 1))
  const todayKey = toDateKey(today)

  return Array.from({ length: MATRIX_WEEKS }, (_, weekIndex) =>
    getWeekDays(addDays(firstMonday, weekIndex * 7)).map((date) => {
      const { done, total } = getDayStats(habits, completions, date, today)
      const rate = total === 0 ? null : Math.round((done / total) * 100)
      const key = toDateKey(date)
      return { date, key, done, total, level: getRateLevel(rate), isFuture: key > todayKey }
    }),
  )
}

// Nombre del mes sobre cada columna que contiene el día 1 de un mes; null en las demás.
export function getMatrixMonthLabels(weeks) {
  return weeks.map((week) => {
    const firstOfMonth = week.find((cell) => cell.date.getDate() === 1)
    return firstOfMonth ? MONTH_NAMES[firstOfMonth.date.getMonth()] : null
  })
}

// --- Barras y ranking --------------------------------------------------------

/**
 * Datos de las barras de cumplimiento:
 * - week: una barra por día (lunes → domingo).
 * - month / 90days: una barra por semana, recortada a los límites del período y
 *   etiquetada con la fecha de su lunes.
 * Una barra sin oportunidades (futuro o nada programado) trae `rate: null`, no 0.
 */
export function getBars(periodId, habits, completions, today) {
  if (periodId === 'week') {
    return getWeekDays(startOfWeek(today)).map((date, index) => {
      const { done, total } = getDayStats(habits, completions, date, today)
      return { label: DAY_NAMES[index], done, total, rate: total === 0 ? null : Math.round((done / total) * 100) }
    })
  }

  const range = getPeriodRange(periodId, today)
  const endKey = toDateKey(range.end)
  const bars = []

  for (let monday = startOfWeek(range.start); toDateKey(monday) <= endKey; monday = addDays(monday, 7)) {
    const sunday = addDays(monday, 6)
    const segment = {
      start: toDateKey(monday) < toDateKey(range.start) ? range.start : monday,
      end: toDateKey(sunday) > endKey ? range.end : sunday,
    }
    bars.push({
      label: `${monday.getDate()} ${MONTH_NAMES[monday.getMonth()]}`,
      ...getRangeStats(habits, completions, segment, today),
    })
  }

  return bars
}

/**
 * Ranking de hábitos del rango: del que más cumple al que menos.
 * Solo entran los hábitos con al menos una oportunidad; el empate se resuelve por nombre.
 */
export function getHabitRanking(habits, completions, range, today) {
  return habits
    .map((habit) => ({
      id: habit.id,
      name: habit.name,
      ...getRangeStats([habit], completions, range, today),
    }))
    .filter((item) => item.total > 0)
    .sort((a, b) => b.rate - a.rate || a.name.localeCompare(b.name, 'es'))
}
