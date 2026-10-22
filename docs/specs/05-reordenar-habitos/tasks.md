# Tareas 05 — Reordenar hábitos
Spec: `docs/specs/05-reordenar-habitos.md` · Plan: `docs/specs/05-reordenar-habitos/plan.md`

- [x] **T1. Función pura `moveItem` con sus tests.** RF-1, RF-5
  - Hecho cuando: en `habitStats.test.js`, mover A,B,C con C→0 da C,A,B; mover con `from === to` o índices fuera de rango devuelve la lista igual; la lista original no se modifica; `npm test` pasa.

- [x] **T2. Acción `reorderHabits` en `useHabits`.** RF-6, RF-7, RF-8, RF-9, RF-11, RNF-1
  - Hecho cuando: mover un hábito deja el nuevo orden guardado y sigue ahí al recargar; sus registros no cambian; si `localStorage.setItem` lanza error, el estado queda como estaba y la acción devuelve `false`; un hábito nuevo sigue yendo al final y borrar uno no altera el orden de los demás.

- [x] **T3. Botones Subir/Bajar, anuncio y aviso de error.** RF-4, RF-5, RF-11, RNF-2, RNF-4
  - Hecho cuando: cada fila de la matriz tiene «Subir» y «Bajar» (deshabilitados en el primero y el último) que reordenan solo con teclado; una región `aria-live` dice «<nombre>, posición N de M»; si el guardado falla, aparece «No se pudo guardar el nuevo orden. Inténtalo de nuevo.» y el orden no cambia.

- [x] **T4. Arrastre con la agarradera `⋮⋮`.** RF-1, RF-2, RF-3, RF-10, RNF-3
  - Hecho cuando: arrastrar con mouse y con el dedo (probado con eventos táctiles a 400 px) reordena; mientras se arrastra se ve la fila atenuada y la línea de destino; Escape o soltar fuera de la tabla cancela sin cambios; un clic o toque sin mover (menos de 5 px) no reordena, y el clic en el nombre sigue abriendo la edición.

- [x] **T5. Verificación final y cierre.** RF-12, RNF-1, RNF-3, criterios de finalización
  - Hecho cuando: `npm test` y `npm run build` pasan sin tocar `package.json`; en el navegador se cumple el ejemplo A,B,C de la spec con recarga; el nuevo orden se ve en las opciones del «+» del bloque y el ranking de Estadísticas sigue por desempeño; un usuario con datos previos ve el mismo orden de antes; la spec pasa a «implementada» y `MEMORY.md` queda actualizada.
