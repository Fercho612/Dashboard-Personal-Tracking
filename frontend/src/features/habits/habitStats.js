import { addDays, fromDateKey, toDateKey } from '../../lib/dates.js'

// Funciones PURAS de cálculo: reciben datos y devuelven un resultado, sin tocar
// estado ni localStorage. Eso las hace fáciles de testear y de reutilizar en el backend.

// ¿Le toca este hábito en la fecha dada según su frecuencia?
export function isScheduledOn(habit, date) {
  if (habit.frequency.type === 'daily') return true
  return habit.frequency.days.includes(date.getDay())
}

function isDone(completions, habitId, dateKey) {
  return (completions[habitId] ?? []).includes(dateKey)
}

// Hábitos que "cuentan" en una fecha: ya existían y les toca ese día.
function getScheduledHabits(habits, date) {
  const dateKey = toDateKey(date)
  return habits.filter((habit) => habit.createdAt <= dateKey && isScheduledOn(habit, date))
}

// Cumplimiento de hoy: cuántos de los hábitos que tocan hoy ya están hechos.
export function getTodayProgress(habits, completions, today) {
  const todayKey = toDateKey(today)
  const scheduled = getScheduledHabits(habits, today)
  const done = scheduled.filter((habit) => isDone(completions, habit.id, todayKey)).length
  return { done, total: scheduled.length }
}

/**
 * Racha actual de un hábito: días PROGRAMADOS consecutivos y completados, contando
 * hacia atrás desde hoy. Los días que no le tocan se saltean (ni suman ni cortan).
 * Si hoy le toca y todavía no está hecho, no se corta: hoy "aún no terminó".
 */
export function getCurrentStreak(habit, completions, today) {
  let streak = 0
  let date = today

  if (isScheduledOn(habit, today) && !isDone(completions, habit.id, toDateKey(today))) {
    date = addDays(today, -1)
  }

  while (toDateKey(date) >= habit.createdAt) {
    if (isScheduledOn(habit, date)) {
      if (!isDone(completions, habit.id, toDateKey(date))) break
      streak++
    }
    date = addDays(date, -1)
  }
  return streak
}

// Racha récord: la secuencia más larga de días programados completados en todo el historial.
export function getBestStreak(habit, completions, today) {
  let best = 0
  let run = 0

  for (let date = fromDateKey(habit.createdAt); date <= today; date = addDays(date, 1)) {
    if (!isScheduledOn(habit, date)) continue
    if (isDone(completions, habit.id, toDateKey(date))) {
      run++
      best = Math.max(best, run)
    } else {
      run = 0
    }
  }
  return best
}

/**
 * Racha global: días consecutivos (hacia atrás) en los que se completaron TODOS los
 * hábitos programados. Los días sin ningún hábito programado se saltean.
 * Igual que en la racha por hábito, hoy incompleto no corta la racha.
 */
export function getGlobalStreak(habits, completions, today) {
  if (habits.length === 0) return 0

  const isDayComplete = (date) => {
    const dateKey = toDateKey(date)
    return getScheduledHabits(habits, date).every((habit) => isDone(completions, habit.id, dateKey))
  }

  const firstDay = habits.map((habit) => habit.createdAt).sort()[0]
  let streak = 0
  let date = isDayComplete(today) ? today : addDays(today, -1)

  while (toDateKey(date) >= firstDay) {
    if (getScheduledHabits(habits, date).length > 0) {
      if (!isDayComplete(date)) break
      streak++
    }
    date = addDays(date, -1)
  }
  return streak
}

/**
 * Consistencia (%) de los últimos `windowDays` días: hechos / programados,
 * sumando todos los hábitos. Hoy solo cuenta si ya está hecho (no penaliza el día en curso).
 * Devuelve null si no hubo nada programado en la ventana.
 */
export function getConsistency(habits, completions, today, windowDays = 30) {
  const todayKey = toDateKey(today)
  let scheduled = 0
  let done = 0

  for (let offset = 0; offset < windowDays; offset++) {
    const date = addDays(today, -offset)
    const dateKey = toDateKey(date)

    for (const habit of getScheduledHabits(habits, date)) {
      const habitDone = isDone(completions, habit.id, dateKey)
      if (dateKey === todayKey && !habitDone) continue
      scheduled++
      if (habitDone) done++
    }
  }

  return scheduled === 0 ? null : Math.round((done / scheduled) * 100)
}
