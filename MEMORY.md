# MEMORY.md — FocusPulse
Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no aporte.
## Estado actual
- v1 funcionando: Agregar y Registrar habitos, mostrar un progreso del mismo.
- Calendario semanal (rama `feature/calendario`): plantilla fija de bloques, categorías creables, franja configurable, redimensionado y resumen de horas.
- Datos en localStorage.
## Decisiones (y por qué)
- LocalStorage: Momentaneo hasta implementar back.
- Días pasados se pueden marcar (también antes de crear el hábito); el futuro no. Un registro retroactivo adelanta el inicio del hábito en las métricas.
- Iniciales de días: L M M J V S D (Miércoles = M, no X), por pedido del dueño.
- Spec de cada funcionalidad en `docs/specs/` antes de implementar (modo SPEC).
- El merge a `main` lo decide el dueño (PR en GitHub).
- Calendario: horas en minutos desde medianoche; color de categoría como clave de paleta (no hex); no se borra una categoría con bloques ni se aplica una franja que deje bloques afuera.
- Navegación entre secciones con `useState` en `App` (sin router).
## Aprendizajes y errores a evitar
- Fechas siempre en hora local (`lib/dates.js`); nunca `toISOString()`, porque corre el día por UTC.
- Edge headless tiene un ancho mínimo de ~492px: para probar en móvil, usar un iframe de 400px.
- Los CSS globales se importan primero (`main.jsx`); si no, el orden del bundle hace que pisen a los de cada sección.
- `showModal()` enfoca el primer elemento del <dialog>: para enfocar otro, hacerlo con un ref después de abrirlo.
- `<dialog>` trae un `max-width` del navegador: anularlo para paneles a pantalla completa.
## Próximos pasos
- Revisión y merge de `feature/calendario` a `main`.
- Decidir si se ajusta la paleta (índigo/violeta y rosa/coral se confunden).
- Siguiente spec: Tareas. 
