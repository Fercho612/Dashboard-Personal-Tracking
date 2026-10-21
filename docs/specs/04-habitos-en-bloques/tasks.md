# Tareas 04 — Hábitos en bloques
Spec: `docs/specs/04-habitos-en-bloques.md` · Plan: `plan.md` (en esta carpeta).
Tareas redactadas con asistencia de IA (Claude). Una por vez: tests primero (en rojo), código, tests en verde, marcar y parar.

- [x] **T1. `isScheduledOnWeekday(habit, weekday)` en `habitStats.js`; `isScheduledOn` la usa por dentro.** RF-6
  - Hecho cuando: hay tests para `daily`, para un día incluido y para uno no incluido en `weekdays`, y todos los tests de Hábitos y de Estadísticas siguen en verde.

- [x] **T2. `getAssignedHabits` y `getAssignableHabits` en `scheduleUtils.js`.** RF-2, RF-3, RF-9, RF-11, RNF-2
  - Hecho cuando: hay tests que cubren el orden de asignación, los ids de hábitos inexistentes ignorados, la lista vacía y el caso "todos asignados" (→ `[]`).

- [x] **T3. `countBlocksWithHabit`, `removeHabitFromBlocks` y `migrateScheduleFromV1` en `scheduleUtils.js`.** RF-12, RF-13, RNF-1
  - Hecho cuando: hay tests que comprueban que el conteo da 0, 1 y N, que quitar un hábito no cambia los demás campos ni los otros bloques, y que la migración agrega `habitIds: []` sin perder categorías ni ajustes.

- [x] **T4. `useSchedule` escribe solo después de la primera acción del usuario (`hasUserChanged` + `update`, como `useHabits`).** Constitución 5
  - Hecho cuando: al abrir el calendario con un JSON guardado corrupto, el valor guardado no cambia; tras crear un bloque, sí se guarda. Commit aparte `fix:`.

- [x] **T5. Clave `dashboard.schedule.v2`: carga v2, o migra v1, o arranca con el estado inicial; normaliza `habitIds`; exporta `loadState`.** RNF-1, RNF-2
  - Hecho cuando: con datos v1 de prueba, el calendario muestra los mismos bloques, y tras un cambio existe la clave v2 con `habitIds` y la v1 sigue igual.

- [ ] **T6. Drawer: sección "Hábitos" con la lista de asignados y botón `×` para quitar; los hábitos llegan desde `SchedulePage` (solo lectura); `habitIds` se guarda con el bloque y se descarta al cancelar.** RF-4, RF-5, RF-10, RF-11, RNF-3
  - Hecho cuando: con `habitIds` puestos a mano, el drawer los lista; quitar uno y guardar persiste el cambio tras recargar; quitar y cancelar no cambia nada; la grilla se ve igual que antes.

- [ ] **T7. Drawer: "Agregar hábito:" + botón verde `+` (`.btn--success`), `<select>` que agrega de a un hábito y se oculta; `+` deshabilitado cuando no quedan hábitos.** RF-1, RF-2, RF-3, RF-7, RF-9, RNF-3
  - Hecho cuando: se pueden agregar dos hábitos uno tras otro, ya sea con el mouse o con el teclado, y aparecen en ese orden; el mismo hábito se puede asignar en dos bloques distintos; con todos asignados, el `+` está deshabilitado y aparece el mensaje.

- [ ] **T8. Drawer: aviso "No le toca este día" y estado sin hábitos con "Ir a Hábitos" (`App` pasa `onNavigate` a `SchedulePage`).** RF-6, RF-8
  - Hecho cuando: un hábito de L-M-V en un bloque del martes muestra el aviso y deja guardar; si se cambia el día del bloque a lunes, el aviso desaparece; sin hábitos, "Ir a Hábitos" cierra el drawer y abre la sección Hábitos.

- [ ] **T9. Borrar un hábito: la confirmación dice en cuántos bloques está, y al confirmar se quita del calendario guardado (`removeHabitFromSavedSchedule`).** RF-12, RF-13, RF-14
  - Hecho cuando: con un hábito en 2 bloques, la confirmación dice "Está en 2 bloques del calendario."; tras borrarlo, el calendario no lo muestra y los bloques siguen; con el calendario guardado corrupto, borrar el hábito no lo modifica.

- [ ] **T10. Verificación final y cierre de la spec.** RNF-3, RNF-4, RF-14
  - Hecho cuando: `npm run build` y `npm test` están en verde; el panel se puede usar a 400px sin scroll horizontal; la matriz de Hábitos y las Estadísticas no cambian al asignar o quitar hábitos; los criterios de finalización de la spec quedan marcados con la verificación documentada.
