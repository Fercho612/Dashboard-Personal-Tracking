# SPEC 01 — Hábitos (MVP frontend)

> Estado: **aprobada e implementada** (pendiente de revisión del dueño)
> Rama: `feature/habitos`
> Referencia visual: `.design-reference/.../h_bitos_diarios_y_rutinas/screen.png` + `serene_pulse/DESIGN.md`
> Spec redactada con asistencia de IA (Claude) a partir de las respuestas del dueño.

## 1. Objetivo

Primera pantalla funcional del dashboard: registrar hábitos, marcarlos día a día en una
matriz semanal y ver métricas simples de constancia. Solo frontend; los datos viven en
`localStorage`. El backend (FastAPI + PostgreSQL) llega en una spec posterior.

## 2. Alcance

### Incluido
1. **Shell de la app**: sidebar con navegación (Hábitos activo; Calendario, Tareas y
   Estadísticas visibles pero deshabilitados con el texto "Próximamente") y un header con la fecha de hoy.
2. **Matriz semanal de consistencia**
   - Filas = hábitos, columnas = días Lunes→Domingo de la semana mostrada.
   - Clic en una celda alterna *hecho ↔ no hecho*.
   - Navegación `‹ ›` entre semanas + etiqueta "Semana N • Mes".
   - Hoy resaltado en la columna. Los días futuros se muestran pero **no se pueden marcar**.
   - Los días en que el hábito no corresponde según su frecuencia se ven atenuados, pero sí se pueden marcar.
3. **CRUD de hábitos**
   - Botón "+ Añadir Nuevo Hábito" → modal con formulario.
   - Editar y borrar desde la fila del hábito (el borrado pide confirmación dentro del propio modal).
4. **Resumen y métricas**
   - Anillo "Cumplimiento de hoy": hábitos hechos hoy / hábitos que tocan hoy.
   - Racha actual (global), consistencia % (últimos 30 días) y racha récord por hábito.

### Excluido (otras specs)
- Tarjetas por rutina (Mañana / Trabajo / Noche).
- Estados "fallado", "en curso" y "programado", y la duración promedio.
- Gráfico de consistencia mensual en barras, buscador y perfil de usuario.
- Backend, autenticación y modo claro.

## 3. Modelo de datos

```js
// Habit
{
  id: "uuid",                 // crypto.randomUUID()
  name: "Meditación",         // obligatorio, 1–60 caracteres
  description: "15 min",      // opcional, máx. 120 caracteres
  frequency: { type: "daily" }            // todos los días
          | { type: "weekdays", days: [1,3,5] }, // 0=Dom … 6=Sáb (convención de Date.getDay)
  createdAt: "2026-10-19"     // fecha ISO, sin hora
}

// Registro de cumplimiento: un Set lógico de "habitId|YYYY-MM-DD"
// Si la clave existe → hecho. Si no → no hecho.
completions: { "<habitId>": ["2026-10-17", "2026-10-19"] }
```

- `localStorage` usa la clave `dashboard.habits.v1` → `{ habits: Habit[], completions }`.
- Fechas siempre en **hora local** con formato `YYYY-MM-DD` (nada de `toISOString()`, que convierte a UTC y puede correr el día).
- Al borrar un hábito se borran también sus completions.

## 4. Reglas de cálculo

| Métrica | Definición |
|---|---|
| *Le toca hoy* | `daily`, o el día de la semana de hoy está incluido en `days`. |
| Cumplimiento de hoy | hechos hoy (entre los que tocan hoy) / total que toca hoy. Si hoy no toca ninguno, se muestra "—". |
| Racha de un hábito | Cantidad de días *programados* consecutivos y completados, contando hacia atrás desde hoy. Si hoy toca pero todavía no está hecho, se empieza a contar desde el día programado anterior, porque hoy aún no cuenta como roto. |
| Racha récord | La racha más larga del historial de ese hábito. |
| Racha actual (global) | Días consecutivos hacia atrás en los que **todos** los hábitos programados se completaron. Se aplica la misma tolerancia con hoy. |
| Consistencia % | completions programadas / días programados, en los últimos 30 días (desde `createdAt` si el hábito es más nuevo). |

Los días anteriores a `createdAt` de un hábito no cuentan en su contra.

## 5. Estructura propuesta

```
frontend/
├── index.html
├── package.json            # react, react-dom, vite (sin librerías de UI)
├── vite.config.js
└── src/
    ├── main.jsx
    ├── App.jsx                     # layout: Sidebar + página
    ├── styles/tokens.css           # variables CSS del DESIGN.md
    ├── styles/global.css
    ├── components/Sidebar.jsx
    ├── features/habits/
    │   ├── HabitsPage.jsx
    │   ├── WeeklyMatrix.jsx
    │   ├── HabitFormModal.jsx
    │   ├── TodaySummary.jsx
    │   ├── useHabits.js            # estado + persistencia en localStorage
    │   ├── habitStats.js           # funciones puras: rachas, % (testeables)
    │   └── habits.css
    └── lib/dates.js                # helpers de fecha local
```

- Iconos: SVG inline escritos a mano, en vez de Material Symbols por CDN.
- Fuente: Plus Jakarta Sans desde Google Fonts.
- Tests: **Vitest** solo para `habitStats.js` y `dates.js`. Es una devDependency nueva y la confirma el dueño.

## 6. Criterios de aceptación

- [x] `npm run build` termina sin errores.
- [x] Puedo crear, editar y borrar un hábito; al recargar la página los cambios siguen ahí.
- [x] Marcar o desmarcar una celda actualiza al instante el anillo, la racha y el %.
- [x] No se puede marcar un día futuro.
- [x] Navegar a semanas pasadas muestra los registros correctos.
- [x] Con 0 hábitos aparece un estado vacío con una llamada a crear el primero.
- [x] El layout es usable a 400px de ancho: la sidebar se colapsa y la matriz hace scroll horizontal.
- [x] Hay tests de `habitStats` que cubren la racha con hoy pendiente, la frecuencia semanal y el hábito creado hace poco.

## 7. Plan de commits

1. `chore: scaffold de frontend con Vite + React`
2. `feat: tokens de diseño y layout con sidebar`
3. `feat: modelo de hábitos y persistencia en localStorage`
4. `feat: matriz semanal con marcado por día`
5. `feat: modal para crear, editar y borrar hábitos`
6. `feat: resumen del día y métricas de racha/consistencia`
7. `test: pruebas de cálculo de rachas y consistencia`

## 8. Verificación realizada

- `npm run build` sin errores y `npm test`: 19 tests en verde (`habitStats`, `dates`).
- Prueba automatizada en Edge headless con datos de ejemplo: marcar una celda, crear un hábito,
  validar el nombre vacío, borrar un hábito, ir a la semana anterior y recargar la página.
- Capturas revisadas a 1400px y 400px de ancho.

### Cambios tras la revisión del dueño
- **Registro retroactivo:** cualquier día pasado se puede marcar, incluso los anteriores
  a `createdAt`. Solo el futuro queda bloqueado. Si se marca un día anterior a la creación,
  el hábito empieza a contar en las métricas desde ese día (`getStartKey` en `habitStats.js`).
- Miércoles se muestra como **M**, no como X. En el selector de días del modal, cada botón
  lleva el nombre completo del día (`title`/`aria-label`) para distinguir los dos "M".
