// Funciones PURAS de cálculo: reciben datos y devuelven un resultado, sin tocar
// estado ni localStorage. Eso las hace fáciles de testear y de reutilizar en el backend.

// ¿Le toca este hábito en la fecha dada según su frecuencia?
export function isScheduledOn(habit, date) {
  if (habit.frequency.type === 'daily') return true
  return habit.frequency.days.includes(date.getDay())
}
