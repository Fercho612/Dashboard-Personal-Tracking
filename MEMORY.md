# MEMORY.md — FocusPulse
Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no aporte.
## Estado actual
- v1 funcionando: Agregar y Registrar habitos, mostrar un progreso del mismo.
- Datos en localStorage.
## Decisiones (y por qué)
- LocalStorage: Momentaneo hasta implementar back.
- Días pasados se pueden marcar (también antes de crear el hábito); el futuro no. Un registro retroactivo adelanta el inicio del hábito en las métricas.
- Iniciales de días: L M M J V S D (Miércoles = M, no X), por pedido del dueño.
- Spec de cada funcionalidad en `docs/specs/` antes de implementar (modo SPEC).
- Rama `feature/habitos` en GitHub; el merge a `main` lo decide el dueño.
## Aprendizajes y errores a evitar
- Fechas siempre en hora local (`lib/dates.js`); nunca `toISOString()`, porque corre el día por UTC.
- Edge headless tiene un ancho mínimo de ~492px: para probar en móvil, usar un iframe de 400px.
## Próximos pasos
- Revisión y merge de `feature/habitos` a `main`.
- Siguiente spec: Calendario semanal o Tareas. 
