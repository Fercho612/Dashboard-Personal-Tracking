// Helpers de fecha que trabajan SIEMPRE en hora local.
//
// ¿Por qué no usar date.toISOString()? Porque convierte a UTC: en Argentina (UTC-3),
// a las 22:00 del lunes devuelve "martes", y el hábito se marcaría en el día equivocado.

// Date → "YYYY-MM-DD" (hora local)
export function toDateKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// "YYYY-MM-DD" → Date a la medianoche local
export function fromDateKey(key) {
  const [year, month, day] = key.split('-').map(Number)
  return new Date(year, month - 1, day)
}

// Devuelve una fecha NUEVA desplazada n días (no muta la original).
export function addDays(date, amount) {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  result.setDate(result.getDate() + amount)
  return result
}

// Lunes de la semana de `date`. getDay() devuelve 0 = domingo … 6 = sábado.
export function startOfWeek(date) {
  const daysSinceMonday = (date.getDay() + 6) % 7
  return addDays(date, -daysSinceMonday)
}

// Los 7 días (lunes → domingo) de la semana que empieza en `monday`.
export function getWeekDays(monday) {
  return Array.from({ length: 7 }, (_, index) => addDays(monday, index))
}

// Número de semana ISO-8601: la semana 1 es la que contiene el primer jueves del año.
export function getIsoWeekNumber(date) {
  const thursday = addDays(date, 3 - ((date.getDay() + 6) % 7))
  const firstThursday = new Date(thursday.getFullYear(), 0, 4)
  const msPerWeek = 7 * 24 * 60 * 60 * 1000
  return 1 + Math.round((thursday - startOfWeek(firstThursday)) / msPerWeek)
}
