# MEMORY.md — HabitFlow
Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no aporte.
## Estado actual
- v1 funcionando: Agregar y Registrar habitos, mostrar un progreso del mismo.
- Calendario semanal (en `main`): plantilla fija de bloques, categorías creables, franja configurable, redimensionado y resumen de horas.
- Datos en localStorage.
- Spec `docs/specs/04-habitos-en-bloques.md` **aprobada** (2026-10-21): asignar hábitos existentes a bloques como referencia visual, visibles solo en el panel del bloque (no en la grilla). El selector agrega de a un hábito; botón "+" en verde (`--color-success`). Plan **aprobado** (calendario pasa a la clave `.v2` con migración y `useSchedule` deja de escribir al montar). Tareas T1–T10 en `docs/specs/04-habitos-en-bloques/tasks.md`, aprobadas, en la rama `feature/habitos-en-bloques`. T1–T9 commiteadas; sigue T10. El dueño pidió hacer todas las tareas restantes (T6–T10) seguidas, con un commit por tarea.
- Estadísticas (rama `feature/estadisticas`, **sin commitear ni mergear**): solo hábitos, selector Semana/Mes/90 días, filtro por hábito, matriz de 17 semanas, barras y ranking. Spec `docs/specs/03-estadisticas-semanales.md` (implementada, pendiente de revisión del dueño); plan y tareas en su carpeta.
## Decisiones (y por qué)
- LocalStorage: Momentaneo hasta implementar back.
- Días pasados se pueden marcar (también antes de crear el hábito); el futuro no. Un registro retroactivo adelanta el inicio del hábito en las métricas.
- Iniciales de días: L M M J V S D (Miércoles = M, no X), por pedido del dueño.
- Spec de cada funcionalidad en `docs/specs/` antes de implementar (modo SPEC).
- El merge a `main` lo decide el dueño (PR en GitHub).
- Calendario: horas en minutos desde medianoche; color de categoría como clave de paleta (no hex); no se borra una categoría con bloques ni se aplica una franja que deje bloques afuera.
- Navegación entre secciones con `useState` en `App` (sin router).
- Nombre del proyecto: HabitFlow (antes FocusPulse). Principios innegociables en `docs/constitution.md`.
## Aprendizajes y errores a evitar
- Fechas siempre en hora local (`lib/dates.js`); nunca `toISOString()`, porque corre el día por UTC.
- Estadísticas lee los datos con `useStatsData` (solo lectura); no usar `useHabits` ahí.
- `useHabits` solo escribe en localStorage después de la primera acción del usuario (`hasUserChanged`): así un JSON corrupto no se pisa al montar la app (constitución 5). Toda acción que modifique el estado debe pasar por `update`, no por `setState`.
- Edge headless tiene un ancho mínimo de ~492px: para probar en móvil, usar un iframe de 400px.
- Calendario guardado en `dashboard.schedule.v2` (bloques con `habitIds`); `v1` solo se lee para migrar y no se toca. Todo bloque nuevo nace con `habitIds: []`.
- Editar archivos con Edit/Write, no con `cat >>` desde Bash: en este Windows (autocrlf) deja finales de línea mezclados en la copia local.
- Los CSS globales se importan primero (`main.jsx`); si no, el orden del bundle hace que pisen a los de cada sección.
- `showModal()` enfoca el primer elemento del <dialog>: para enfocar otro, hacerlo con un ref después de abrirlo.
- `<dialog>` trae un `max-width` del navegador: anularlo para paneles a pantalla completa.
## Próximos pasos
- Decidir si se ajusta la paleta (índigo/violeta y rosa/coral se confunden).
- Revisar Estadísticas, commitear por pasos y abrir el PR a `main`.
- Decisión: no habrá lista de tareas; no reintroducirla.
- Las specs van en `docs/specs/NN-nombre.md` (la constitución manda sobre la ruta `specs/` de la skill sdd).
