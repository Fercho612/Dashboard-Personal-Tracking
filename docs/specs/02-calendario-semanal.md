# SPEC 02 — Calendario semanal (bloques de tiempo)

> Estado: **aprobada (v2) e implementada** (pendiente de revisión del dueño)
> Rama: `feature/calendario`
> Referencia visual: `.design-reference/.../calendario_semanal_y_bloques_de_tareas/` + `serene_pulse/DESIGN.md`
> Spec redactada con asistencia de IA (Claude) a partir de las respuestas del dueño.

## 1. Objetivo

Planificar una **semana tipo** con bloques de tiempo (time-blocking): "los lunes de 09:00 a
11:00 hago Trabajo profundo". La plantilla es fija y se repite todas las semanas. Solo
frontend; los datos se guardan en `localStorage`, igual que los hábitos.

## 2. Alcance

### Incluido
1. **Navegación entre secciones**: "Calendario Semanal" se habilita en la sidebar. El cambio
   de sección se resuelve con un `useState` en `App`, sin instalar un router.
2. **Grilla semanal**
   - Columnas Lunes→Domingo y filas por hora dentro de la **franja horaria visible**
     (07:00–22:00 por defecto, configurable; ver punto 6).
   - Cada bloque se ubica según su hora de inicio y su duración, con borde izquierdo y
     fondo del color de su categoría. Muestra el título y el horario.
   - Se resalta la columna del día de hoy.
   - Clic en un hueco vacío → abre el panel de creación con ese día y esa hora precargados.
   - Clic en un bloque → abre el panel de edición.
3. **Redimensionar bloques con el mouse**
   - Cada bloque tiene una manija arriba y otra abajo. Al arrastrar la de arriba cambia la
     hora de inicio; al arrastrar la de abajo, la de fin.
   - Ajusta en saltos de 15 minutos y la duración mínima es de 15 minutos.
   - No deja invadir otro bloque ni salir de la franja visible: el borde se detiene en el límite.
   - El cambio se guarda al soltar. Con la tecla Esc durante el arrastre se cancela.
   - Funciona con mouse, lápiz y touch (Pointer Events). La alternativa accesible por
     teclado sigue siendo editar las horas en el panel.
4. **Panel lateral (drawer) para crear, editar y borrar bloques**
   - Campos: título, día de la semana (uno solo), hora de inicio, hora de fin y categoría.
   - El borrado pide confirmación dentro del panel, como en hábitos.
5. **Categorías creables**
   - Se arranca con 4 categorías de ejemplo: Trabajo profundo, Salud, Reuniones y Personal.
     Se pueden renombrar o borrar como cualquier otra.
   - Un diálogo "Gestionar categorías" permite crear, renombrar, cambiar el color y borrar.
   - El color se elige de una **paleta de 8 colores** pensada para el tema oscuro, en vez de
     un selector libre. Así cualquier categoría se ve bien y el texto sigue legible.
   - **No se puede borrar una categoría que tiene bloques**; el diálogo dice cuántos tiene.
     Primero hay que reasignar o borrar esos bloques.
   - Chips de filtro arriba de la grilla: "Todos" + uno por categoría, con la cantidad de bloques.
     Se pueden activar varias categorías a la vez. El filtro solo cambia lo que se ve, no los datos.
6. **Franja horaria configurable**
   - Botón de ajustes en la cabecera del calendario para elegir la hora de inicio y la de fin
     de la grilla, en **horas enteras**, con un mínimo de 1 hora de franja.
   - Si hay bloques fuera de la nueva franja, **no se permite el cambio** y el mensaje dice
     cuáles quedarían afuera. No se borra ni se recorta nada en silencio.
   - Los bloques nuevos y los redimensionados se validan contra la franja actual.
7. **Resumen de horas**: total de horas planificadas en la semana y horas por categoría.
   Siempre cuenta todos los bloques, aunque haya filtros activos.

### Excluido (otras specs)
- Bloques con fecha concreta y navegación entre semanas.
- Subtareas dentro del bloque.
- **Mover** un bloque arrastrándolo a otro día u hora. Solo se redimensiona; para moverlo
  se edita en el panel.
- Línea de "hora actual", buscador y relación con hábitos o tareas.

## 3. Modelo de datos

```js
// Block
{
  id: "uuid",
  title: "Trabajo profundo",   // obligatorio, 1–60 caracteres
  day: 1,                      // 0 = domingo … 6 = sábado (misma convención que getDay y los hábitos)
  start: 540,                  // minutos desde la medianoche → 09:00
  end: 660,                    // → 11:00
  categoryId: "uuid"
}

// Category
{
  id: "uuid",
  name: "Trabajo profundo",    // obligatorio, 1–30 caracteres, sin repetir (ignora mayúsculas)
  color: "indigo"              // clave de la paleta: indigo | emerald | amber | coral | sky | violet | pink | slate
}

// Settings
{ dayStart: 420, dayEnd: 1320 }  // franja visible en minutos: 07:00–22:00
```

- Las horas se guardan como **minutos desde la medianoche** (enteros). Así comparar,
  restar y calcular solapamientos es aritmética simple. Se convierten a `"HH:MM"` solo para mostrar.
- El color se guarda como **clave de paleta**, no como hex. Si mañana se ajusta un tono,
  cambia en un solo lugar y todas las categorías lo heredan.
- `localStorage` usa la clave `dashboard.schedule.v1` → `{ blocks, categories, settings }`.
  La primera vez se cargan las 4 categorías de ejemplo y la franja 07:00–22:00.

## 4. Reglas de validación

| Regla | Mensaje |
|---|---|
| El título no puede estar vacío | "El título es obligatorio." |
| `start < end` | "La hora de fin debe ser posterior a la de inicio." |
| Dentro de la franja visible | "El bloque debe estar entre 07:00 y 22:00." (con la franja actual) |
| Múltiplos de 15 minutos | Los selectores de hora solo ofrecen :00, :15, :30 y :45. |
| **Sin solapamiento** en el mismo día | "Se superpone con «Gym» (18:00–19:00)." |
| Nombre de categoría único | "Ya existe una categoría con ese nombre." |
| Categoría en uso | "No se puede borrar: tiene 3 bloques." |
| Franja que deja bloques afuera | "Quedarían fuera: «Gym» (Lun 06:00–07:00)…" |

- Dos bloques se solapan si `a.start < b.end && b.start < a.end`. Si uno termina justo
  cuando empieza el otro (10:00–11:00 y 11:00–12:00), **no** cuenta como solapamiento.
- Al editar o redimensionar, el bloque no se compara consigo mismo.
- Al redimensionar no aparecen mensajes de error: el borde simplemente se detiene en el
  límite permitido (otro bloque, la franja o la duración mínima).

## 5. Estructura propuesta

```
frontend/src/
├── App.jsx                         # + estado de sección activa
├── components/Sidebar.jsx          # habilitar "Calendario Semanal" y recibir onNavigate
├── styles/components.css           # .card, .btn, .input, .modal… salen de habits.css
└── features/schedule/
    ├── SchedulePage.jsx
    ├── WeekGrid.jsx                # grilla + posicionamiento de bloques
    ├── ScheduleBlock.jsx           # un bloque + manijas de redimensionado
    ├── BlockDrawer.jsx             # panel lateral (<dialog> con estilo de drawer)
    ├── CategoryManager.jsx         # diálogo para crear, editar y borrar categorías
    ├── RangeSettings.jsx           # diálogo para la franja horaria
    ├── CategoryFilters.jsx
    ├── HoursSummary.jsx
    ├── useSchedule.js              # estado + localStorage
    ├── scheduleUtils.js            # funciones puras: minutos↔HH:MM, solapamiento,
    │                               #   límites de redimensionado, horas por categoría
    ├── scheduleUtils.test.js
    ├── palette.js                  # los 8 colores de categoría
    └── schedule.css
```

## 6. Criterios de aceptación

- [x] `npm run build` y `npm test` en verde, y los tests de hábitos siguen pasando.
- [x] Puedo ir de Hábitos a Calendario y volver desde la sidebar.
- [x] Puedo crear, editar y borrar bloques; al recargar la página siguen ahí.
- [x] Clic en un hueco vacío abre el panel con el día y la hora precargados.
- [x] No se puede guardar un bloque que se superpone; el error dice con cuál choca.
- [x] Al redimensionar, el bloque ajusta en saltos de 15 min, no invade otro bloque ni sale de
      la franja, y Esc cancela el arrastre.
- [x] Puedo crear, renombrar, recolorear y borrar categorías; no puedo borrar una que tiene bloques.
- [x] Puedo cambiar la franja horaria; si deja bloques afuera, el cambio se rechaza y explica por qué.
- [x] Los filtros ocultan y muestran categorías; el resumen de horas no cambia con el filtro.
- [x] A 400px de ancho la grilla hace scroll horizontal y el drawer ocupa toda la pantalla.
- [x] Tests de `scheduleUtils`: conversión de horas, solapamiento (incluido el caso de bloques
      contiguos y el de edición), límites de redimensionado, bloques fuera de franja y suma
      de horas por categoría.

## 7. Plan de commits

1. `refactor: mover estilos compartidos a styles/components.css` *(aprobado)*
2. `feat: navegación entre secciones desde la sidebar`
3. `feat: modelo de bloques, categorías y persistencia en localStorage`
4. `feat: grilla semanal con bloques posicionados por horario`
5. `feat: drawer para crear, editar y borrar bloques con validación de solapamiento`
6. `feat: redimensionar bloques arrastrando sus bordes`
7. `feat: gestión de categorías y filtros`
8. `feat: franja horaria configurable`
9. `feat: resumen de horas por categoría`
10. `test: pruebas de utilidades de horario, solapamiento y redimensionado`

## 8. Verificación realizada

- `npm run build` sin errores y `npm test` con 48 tests en verde (27 nuevos de `scheduleUtils`).
- Pruebas automatizadas en Edge headless con datos de ejemplo:
  - Bloques: clic en un hueco (precarga día/hora y recorta el fin si choca), validaciones,
    error de solapamiento, editar, borrar y cerrar con Esc.
  - Redimensionado: freno contra el vecino, freno en la franja, ajuste a 15', duración mínima y Esc.
  - Categorías y filtros: chips combinables, nombre duplicado, borrado bloqueado con bloques,
    renombrar/recolorear (los bloques cambian de color) y borrado de una vacía.
  - Franja: rechazo con bloques afuera, franja inválida, cambio a 06:00–23:00.
- Capturas revisadas a 1300px y 400px de ancho.

### Decisiones tomadas durante la implementación
- **Los estilos globales se importan en `main.jsx`**, antes que cualquier página. Antes se
  importaban en `App.jsx` después de las páginas y `components.css` pisaba reglas de
  `schedule.css` (commit `fix:` aparte).
- **El filtro solo cambia lo que se dibuja.** Solapamiento y redimensionado se calculan con
  todos los bloques, para que no se pueda invadir uno oculto.
- **Contraste de la paleta:** el validador de color marca pares difíciles de distinguir:
  índigo/violeta para daltonismo protán y rosa/coral incluso con visión normal. Por eso el color
  nunca es la única pista: los bloques muestran su título, y los chips y la leyenda del resumen,
  el nombre de la categoría. Queda pendiente decidir si se ajustan esos tonos.
