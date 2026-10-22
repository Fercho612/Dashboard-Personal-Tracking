# Plan 05 — Reordenar hábitos
Spec: `docs/specs/05-reordenar-habitos.md` (aprobada).

## Idea central
El orden de la lista de Hábitos **es el orden del arreglo `habits` guardado**. Reordenar es mover un elemento del arreglo: no se agrega ningún campo ni cambia la clave `dashboard.habits.v1`, así que no hace falta migración (constitución 5). Los hábitos existentes ya están en orden de creación (RF-8) y los nuevos ya se agregan al final (RF-7). Borrar ya conserva el orden de los demás (RF-9).

## Archivos
```
frontend/src/features/habits/
├── habitStats.js        # + moveItem(list, from, to)
├── habitStats.test.js   # + tests de moveItem
├── useHabits.js         # + reorderHabits(from, to): guarda y devuelve si salió bien
├── WeeklyMatrix.jsx     # agarradera de arrastre y botones subir/bajar por fila
├── HabitsPage.jsx       # conecta reorderHabits y muestra el aviso si falla el guardado
└── habits.css           # estilos de la agarradera, la fila arrastrada y el indicador de destino
```
Los módulos de Calendario y Estadísticas **no se tocan**: ya leen `habits` en su orden, así que RF-12 se cumple solo.

## Función pura
`moveItem(list, from, to)` devuelve una copia con el elemento de `from` puesto en `to` (los demás conservan su orden relativo). Si `from === to` o algún índice está fuera de rango, devuelve la misma lista sin cambios (RF-5, soltar en el mismo lugar).

## Cómo funciona
- **Guardado (RF-6, RF-11):** `reorderHabits` calcula la lista nueva, intenta escribirla en `localStorage` y solo si no falla actualiza el estado y devuelve `true`. Si falla, no toca el estado (queda el orden anterior) y devuelve `false`; la página muestra el aviso «No se pudo guardar el nuevo orden. Inténtalo de nuevo.» Pasa por `update`, como toda acción (aprendizaje de `hasUserChanged`).
- **Arrastre (RF-1, 2, 3, 10):** eventos de puntero (`pointerdown/move/up`) sobre una agarradera `⋮⋮` al inicio de cada fila. Un solo camino sirve para mouse y dedo; la agarradera usa `touch-action: none` para que el dedo arrastre en vez de hacer scroll. El destino se calcula comparando la posición vertical del puntero con la mitad de cada fila.
  - Arrastre solo después de mover más de 5 px: un clic o toque sin mover no reordena (caso límite), y el clic sobre el nombre sigue abriendo la edición.
  - Mientras se arrastra: la fila queda atenuada y una línea marca dónde caería (RF-2).
  - Escape o soltar fuera de la tabla cancela sin cambios (RF-10).
- **Teclado y lector de pantalla (RF-4, 5, RNF-4):** cada fila tiene botones «Subir» y «Bajar» (`aria-label="Subir <nombre>"`), deshabilitados en el primero y el último. Una región `aria-live="polite"` anuncia «<nombre>, posición N de M» tras cada movimiento. Sirven también en el celular como alternativa al arrastre.

## Decisiones
| Decisión | Alternativa descartada | Por qué |
|---|---|---|
| Reordenar el arreglo guardado | Guardar una lista de orden aparte | Sin cambio de formato ni migración; el plan queda corto. Costo: el orden se ve también en las opciones del «+» y en el filtro de Estadísticas (RF-12 ya lo contempla) |
| Eventos de puntero hechos a mano | Arrastrar y soltar nativo de HTML | El nativo no funciona con el dedo en celular (RF-3). |
| Sin librería de arrastre | `dnd-kit` u otra | La constitución 1 prohíbe dependencias nuevas sin aprobación |
| Agarradera aparte del nombre | Arrastrar desde toda la fila | Evita choques con los clics de las celdas y del nombre |

## Riesgos
- **Tablas y scroll:** la matriz tiene scroll horizontal en pantallas chicas; la agarradera debe quedar en la columna fija de hábito y probarse a 400 px (RNF-3).
- **Escritura que falla:** `localStorage` casi nunca falla; se prueba simulando el error con un test del hook o a mano.
