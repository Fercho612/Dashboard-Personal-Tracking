# Plan 04 — Hábitos en bloques
Spec: `docs/specs/04-habitos-en-bloques.md` (aprobada).
Plan redactado con asistencia de IA (Claude) a partir de la spec.

## Archivos y responsabilidades
```
frontend/src/
├── App.jsx                          # + pasa onNavigate a SchedulePage (para el acceso a Hábitos, RF-8)
├── features/habits/
│   ├── habitStats.js                # + isScheduledOnWeekday(habit, weekday); isScheduledOn la usa por dentro
│   ├── habitStats.test.js           # + tests de isScheduledOnWeekday
│   ├── HabitsPage.jsx               # al borrar: cuenta los bloques del hábito y lo quita del calendario (RF-12, 13)
│   └── HabitFormModal.jsx           # + prop blockCount → "Está en N bloques del calendario." en la confirmación
└── features/schedule/
    ├── scheduleUtils.js             # + funciones puras de hábitos asignados y migración v1 → v2
    ├── scheduleUtils.test.js        # + tests de esas funciones
    ├── useSchedule.js               # clave v2 con migración desde v1, escritura solo tras una acción
    │                                #   del usuario, export de loadState y removeHabitFromSavedSchedule
    ├── SchedulePage.jsx             # lee los hábitos (solo lectura) y los pasa al drawer
    ├── BlockDrawer.jsx              # + sección "Agregar hábito:" con selector, lista y avisos
    └── schedule.css                 # estilos de la sección y del botón verde
```

## Modelo de datos
```js
// Block (cambio: se agrega habitIds)
{ id, title, day, start, end, categoryId,
  habitIds: ["uuid", …] }   // ids de hábitos asignados, en orden de asignación; [] si no tiene
```
- **La clave pasa de `dashboard.schedule.v1` a `dashboard.schedule.v2`** (constitución 5: si
  cambia el formato guardado, cambia la versión de la clave, con migración).
- Migración al cargar: si no existe v2 pero sí v1, se lee v1 y se agrega `habitIds: []` a
  cada bloque. **v1 no se borra ni se modifica**: queda como respaldo (RNF-1).
- Al cargar v2, un bloque sin `habitIds` válido (no es un array) se normaliza a `[]`.
- Los ids de hábitos que ya no existen se ignoran al mostrar (RNF-2), no se borran al cargar.

## Funciones puras
En `habitStats.js` (la regla de "le toca" vive en un solo lugar, spec 01):

| Función | Devuelve |
|---|---|
| `isScheduledOnWeekday(habit, weekday)` | `true` si el hábito toca ese día (0 = domingo … 6 = sábado). `isScheduledOn(habit, date)` pasa a llamarla con `date.getDay()` |

En `scheduleUtils.js`:

| Función | Devuelve |
|---|---|
| `getAssignedHabits(habitIds, habits)` | Los hábitos de `habitIds`, en ese orden, sin los ids que no existen (RNF-2) |
| `getAssignableHabits(habitIds, habits)` | Los hábitos que no están en `habitIds`, en el orden de la lista de hábitos (RF-2, RF-9) |
| `countBlocksWithHabit(blocks, habitId)` | Cantidad de bloques que tienen ese hábito (RF-12) |
| `removeHabitFromBlocks(blocks, habitId)` | Bloques nuevos sin ese id; los demás campos quedan iguales (RF-13) |
| `migrateScheduleFromV1(saved)` | Estado v1 con `habitIds: []` en cada bloque |

## Algoritmos (pseudocódigo)
```
loadState (useSchedule):
  si existe v2 → parsear; normalizar blocks (habitIds no array → [])
  si no, si existe v1 → parsear y migrateScheduleFromV1
  si no → createInitialState
  si el JSON está corrupto → createInitialState, sin escribir nada todavía

useSchedule:
  igual que useHabits: hasUserChanged + update(); solo escribe v2 después de la
  primera acción del usuario (hoy escribe al montar y pisaría un v2 corrupto)

removeHabitFromSavedSchedule(habitId):         // la llama Hábitos al borrar
  leer lo guardado (v2, o v1 migrado). Si no hay nada o está corrupto → no escribir
  si countBlocksWithHabit == 0 → no escribir
  escribir v2 con removeHabitFromBlocks

BlockDrawer, sección de hábitos:
  assigned   = getAssignedHabits(habitIds, habits)
  assignable = getAssignableHabits(habitIds, habits)
  por cada assigned: aviso "No le toca este día" si !isScheduledOnWeekday(habit, day)
  // `day` es el estado del drawer: si se cambia el día, los avisos se recalculan solos
```

## Interfaz
- **Sección en el drawer**, entre "Categoría" y los botones de acción: título "Hábitos".
  - Lista de hábitos asignados: nombre, aviso "No le toca este día" (si aplica) y botón `×` con
    `aria-label="Quitar <nombre> del bloque"` (RF-4, RNF-3).
  - Línea "Agregar hábito:" + botón verde `+` (`aria-label="Agregar hábito"`) (RF-1).
  - Al pulsar `+` aparece una fila de botones-píldora (clase `.chip`, ya existente), uno por hábito
    asignable, con el foco en el primero. Al elegir uno se agrega al final de la lista, la fila se
    oculta y el foco vuelve al `+` (RF-2, RF-3). Un botón "Cancelar" al lado la oculta sin agregar.
  - Sin hábitos creados: "Todavía no tienes hábitos" + botón "Ir a Hábitos". Si se pulsa, se
    cierra el drawer sin guardar y se navega a Hábitos con `onNavigate` (RF-8).
  - Todos asignados: el `+` queda deshabilitado y se muestra "Ya agregaste todos tus hábitos" (RF-9).
- `habitIds` es estado local del drawer (`useState`): se guarda con el resto en `onSave` y se
  descarta al cancelar (RF-5).
- **Botón verde:** clase `.btn--success` en `schedule.css`, con la forma de `.btn` y el fondo
  `var(--color-success)`.
- **Confirmación al borrar un hábito:** "¿Borrar el hábito y todo su historial? Está en 3 bloques
  del calendario." (o "en 1 bloque"). Sin bloques, el texto queda como hoy.
- La grilla (`WeekGrid`, `ScheduleBlock`) no se toca (RF-10).

## Decisiones justificadas
| Decisión | Alternativa descartada | Por qué |
|---|---|---|
| `habitIds` dentro de cada bloque | Una lista aparte de pares `{ blockId, habitId }` | Borrar un bloque borra sus asignaciones solo, y el orden queda en el propio array |
| Clave v2 con migración y v1 intacta | Agregar el campo en v1 y leerlo como opcional | Lo pide la constitución 5, y v1 queda como respaldo si algo sale mal |
| Corregir la escritura al montar de `useSchedule` (`hasUserChanged`) | Dejarla como está | Hoy pisaría un v2 corrupto al abrir el calendario (constitución 5). Mismo arreglo que ya tiene `useHabits` |
| Al borrar un hábito, Hábitos limpia el calendario guardado con una función exportada de `useSchedule.js` | Dejar ids colgados y solo ignorarlos al mostrar | RF-13 pide quitarlo de verdad. La persistencia sigue en los archivos `use*.js` (constitución 3) |
| Calendario lee los hábitos con `loadState` de `useHabits.js` (solo lectura) | Usar `useHabits` | Ese hook expone acciones de escritura que el calendario no necesita (RF-14); igual que Estadísticas |
| `isScheduledOnWeekday` en `habitStats.js` | Repetir la regla en `scheduleUtils.js` | El aviso de RF-6 tiene que coincidir siempre con lo que Hábitos considera "le toca" |
| Fila de botones-píldora que aparece al pulsar `+` (cambio hecho en T7) | `<select>` nativo (decisión inicial) | Los `<select>` de Chromium cambian de valor con solo pulsar las flechas, sin confirmar: con teclado se agregaría un hábito sin querer (RNF-3). Los botones se eligen con Tab y Enter, y se acomodan en varias líneas a 400px (RNF-4) |

## Riesgos y cosas a vigilar
- **Las dos secciones no conviven montadas:** `App` muestra una sección a la vez, así que al volver
  al calendario `useSchedule` relee lo guardado y ve el hábito ya quitado. Si un día se muestran
  juntas, esto hay que revisarlo.
- **Calendario v2 corrupto al borrar un hábito:** no se escribe nada. El id queda colgado, pero no
  se ve (RNF-2) y no se pierden datos.
- **Esc con las opciones abiertas** cierra el `<dialog>` entero (comportamiento nativo). Es aceptable:
  se descarta todo, igual que al cancelar (RF-5).
- **Cambios mínimos en Hábitos** (una función nueva en `habitStats`, un texto en el modal, la
  limpieza al borrar): los tests de Hábitos y de Estadísticas deben seguir en verde.
