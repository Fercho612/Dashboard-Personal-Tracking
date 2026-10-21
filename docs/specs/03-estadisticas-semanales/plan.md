# Plan 03 — Estadísticas
Spec: `docs/specs/03-estadisticas-semanales.md` (aprobada).
Plan redactado con asistencia de IA (Claude) a partir de la spec.

## Archivos y responsabilidades
```
frontend/src/
├── App.jsx                          # + renderiza StatsPage cuando activeSection === 'stats'
├── components/Sidebar.jsx           # habilitar "Estadísticas" (enabled: true)
├── features/habits/
│   ├── habitStats.js                # + export de getScheduledHabits (hoy es privada). Sin otros cambios
│   └── useHabits.js                 # + export de loadState (lectura sin escritura)
└── features/stats/
    ├── StatsPage.jsx                # cabecera con selectores, estado vacío y composición de paneles
    ├── ComplianceCard.jsx           # tarjeta de tasa de cumplimiento (RF-6..9)
    ├── ConsistencyCard.jsx          # tarjeta de racha y días perfectos (RF-10, 11)
    ├── ConsistencyMatrix.jsx        # mapa de calor de 17 semanas + línea de detalle (RF-12..15)
    ├── PeriodBars.jsx               # barras por día o por semana (RF-16..18)
    ├── HabitRanking.jsx             # ranking de hábitos (RF-19, 20)
    ├── useStatsData.js              # lee los hábitos SIN escribir (RF-22, RF-23)
    ├── statsUtils.js                # funciones puras de cálculo
    ├── statsUtils.test.js
    └── stats.css
```

## Funciones puras (`statsUtils.js`)
Todas reciben `today` como parámetro y trabajan con `lib/dates.js` (hora local). Reutilizan
`isScheduledOn`, `getStartKey` y `getScheduledHabits` de `habitStats.js`, para que "le toca" y
"desde cuándo cuenta" sean exactamente la regla de Hábitos.

| Función | Devuelve |
|---|---|
| `getPeriodRange(periodId, today)` | `{ start, end }` (Date). `periodId`: `'week' \| 'month' \| '90days'` |
| `getPreviousRange(periodId, today)` | `{ start, end }` del tramo equivalente anterior |
| `getDayStats(habits, completions, date, today)` | `{ done, total }` de un día. `total = 0` si es futuro o no hay oportunidades |
| `getRangeStats(habits, completions, range, today)` | `{ done, total, rate }`; `rate` es `null` si `total = 0` |
| `getPerfectDays(habits, completions, range, today)` | `{ perfectDays, activeDays, longestStreak }` |
| `getMatrixWeeks(habits, completions, today)` | 17 columnas × 7 días: `{ date, done, total, level, isFuture }` |
| `getRateLevel(rate)` | `0..4`, o `null` si no hay oportunidades |
| `getBars(periodId, habits, completions, today)` | lista `{ label, rate, done, total }` por día o por semana |
| `getHabitRanking(habits, completions, range, today)` | hábitos con `total > 0`, ordenados por tasa y luego por nombre |

## Algoritmos (pseudocódigo)
```
getDayStats(date):
  si date > today → {0, 0}
  scheduled = getScheduledHabits(habits, completions, date)
  si date == today → scheduled = scheduled.filter(hecho)     // hoy solo cuenta si ya está hecho
  done = scheduled.filter(hecho en date).length
  → { done, total: scheduled.length }

getPreviousRange('month'):
  lastMonthStart = día 1 del mes anterior
  endDay = min(today.getDate(), días del mes anterior)
  → { start: lastMonthStart, end: lastMonthStart + (endDay - 1) }

getPerfectDays(range):
  para cada día de range: stats = getDayStats
    si total == 0 → saltear (no suma ni corta)
    si done == total → perfectDays++, run++, longest = max(longest, run)
    si no → run = 0
  → { perfectDays, activeDays, longestStreak: longest }

getMatrixWeeks:
  lunes = startOfWeek(today) - 16 semanas
  17 columnas de getWeekDays; nivel = getRateLevel(rate redondeada)

getBars('week'):  7 barras, una por día (lunes → domingo)
getBars('month' | '90days'): semanas de lunes a domingo recortadas al rango; etiqueta = fecha del lunes
```
`getRateLevel`: `null` → sin oportunidades; `0` → 0; `1–33` → 1; `34–66` → 2; `67–99` → 3; `100` → 4
(sobre el % ya redondeado, igual que la tasa mostrada).

## Interfaz
- **Cabecera:** título «Estadísticas», y a la derecha el selector de período (tres botones tipo
  segmento) y el selector de hábito (`<select>`).
- **Fila de tarjetas:** cumplimiento (con diferencia en pts) y constancia.
- **Matriz de constancia:** celdas `button` enfocables; debajo, una línea de detalle con la fecha y
  «N de M hábitos».
- **Fila inferior:** barras (ancho amplio) y ranking.
- **Estado vacío:** sin hábitos, mensaje y botón «Ir a Hábitos» (usa `onNavigate`).
- Estilos con los tokens de `styles/tokens.css` y las clases compartidas de `styles/components.css`.
  A 400 px las tarjetas pasan a una columna y solo la matriz hace scroll horizontal.

## Decisiones justificadas
| Decisión | Alternativa descartada | Por qué |
|---|---|---|
| Barras, matriz y ranking con HTML/CSS a mano | Chart.js | Son barras y cuadrículas simples; evita una dependencia (constitución 1, RNF-7) |
| Lectura de datos con un hook propio de solo lectura (`useStatsData`) | Reutilizar `useHabits` | `useHabits` escribía en `localStorage` en cada montaje (ya corregido) y es más hook del que hace falta para solo leer (RF-22, RF-23, constitución 5) |
| Detalle de la matriz en una línea fija bajo la grilla (hover y foco) | Tooltip flotante | Funciona igual con mouse, teclado y táctil, y no necesita posicionamiento |
| Un solo `getDayStats` que usan tarjetas, barras, matriz y ranking | Un cálculo distinto por panel | Todos los paneles coinciden entre sí, y las reglas de «hoy» y «futuro» viven en un solo lugar |
| Filtro de hábito = filtrar la lista `habits` antes de calcular | Parámetro `habitId` en cada función | Las funciones no cambian: reciben menos hábitos |
| Período y filtro en `useState` de la página | Guardarlos en `localStorage` | La spec los deja fuera de alcance |

## Riesgos y cosas a vigilar
- **Hábitos pisa JSON corrupto:** *(resuelto)* `useHabits` sobrescribía un JSON corrupto al
  montarse. Se corrigió aparte: ahora solo guarda tras la primera acción del usuario.
- **Dos cambios mínimos en código de Hábitos** (exportar dos funciones); no cambia su comportamiento
  y los tests existentes deben seguir en verde.
- **Hoy:** el día en curso solo cuenta si ya está hecho, así que la tasa de «hoy» nunca baja por
  estar pendiente.
