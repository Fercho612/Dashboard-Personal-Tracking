# MEMORY.md — HabitFlow
Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no aporte.
## Estado actual
- v1 funcionando: Agregar y Registrar habitos, mostrar un progreso del mismo.
- Calendario semanal (en `main`): plantilla fija de bloques, categorías creables, franja configurable, redimensionado y resumen de horas.
- Datos en localStorage.
- Estadísticas (rama `feature/estadisticas`, **sin commitear ni mergear**): solo hábitos, selector Semana/Mes/90 días, filtro por hábito, matriz de 17 semanas, barras y ranking. Spec `docs/specs/03-estadisticas-semanales.md` (implementada, pendiente de revisión del dueño); plan y tareas en su carpeta.
- Reordenar hábitos (spec 05 `docs/specs/05-reordenar-habitos.md`, **implementada** T1–T5 en la rama `feature/habitos`, **sin mergear**; pendiente de revisión del dueño): agarradera `⋮⋮` (mouse/dedo) + botones Subir/Bajar (teclado) en la matriz; el orden es el del arreglo `habits` guardado (sin migración), así que también lo siguen el filtro de Estadísticas y, cuando se junte con `feature/habitos-en-bloques`, las opciones del «+» del bloque; el ranking sigue por desempeño. El chequeo del panel del bloque (RF-12) se hizo sobre `habitos-en-bloques`, no en esta rama.
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
- Pruebas táctiles/arrastre en Edge headless: eventos con `Input.dispatchMouseEvent`/`dispatchTouchEvent`; el elemento tiene que estar dentro de la pantalla (hacer `scrollIntoView` antes), si no el toque cae en la página y la desplaza.
- Edge headless tiene un ancho mínimo de ~492px: para probar en móvil, usar un iframe de 400px.
- Los CSS globales se importan primero (`main.jsx`); si no, el orden del bundle hace que pisen a los de cada sección.
- `showModal()` enfoca el primer elemento del <dialog>: para enfocar otro, hacerlo con un ref después de abrirlo.
- `<dialog>` trae un `max-width` del navegador: anularlo para paneles a pantalla completa.
## Próximos pasos
- Decidir si se ajusta la paleta (índigo/violeta y rosa/coral se confunden).
- Revisar Estadísticas, commitear por pasos y abrir el PR a `main`.
- Decisión: no habrá lista de tareas; no reintroducirla.
- Las specs van en `docs/specs/NN-nombre.md` (la constitución manda sobre la ruta `specs/` de la skill sdd).
