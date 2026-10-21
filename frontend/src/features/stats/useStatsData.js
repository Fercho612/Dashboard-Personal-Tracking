import { useState } from 'react'
import { loadState } from '../habits/useHabits.js'

/**
 * Hook de SOLO LECTURA: entrega los hábitos y sus registros tal como están guardados.
 * No usamos `useHabits` aquí porque ese hook escribe en localStorage cada vez que se monta,
 * y las estadísticas nunca deben modificar ni pisar los datos del usuario (por ejemplo,
 * un JSON corrupto que todavía se podría recuperar).
 */
export function useStatsData() {
  // Inicialización perezosa: se lee una sola vez al abrir la sección.
  // Como Estadísticas es de solo lectura, los datos no cambian mientras se mira la página.
  const [data] = useState(loadState)
  return data
}
