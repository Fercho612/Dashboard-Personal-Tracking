# AGENTS.md — Reglas del agente de IA

Este archivo define cómo debe trabajar cualquier agente de IA (o copiloto) dentro de este
repositorio. Léelo completo antes de escribir una sola línea de código.

---

## 1. Propósito del proyecto

Dashboard personal de productividad para anotar:

- **Hábitos** — registrar y marcar hábitos diarios.
- **Bloques de horario semanal** — planificar la semana en bloques de tiempo.
- **Progreso** — métricas de productividad (gráficos simples de evolución).

> ⚠️ **Este es un proyecto de aprendizaje y portfolio.** El objetivo no es solo "que
> funcione", sino demostrar conocimientos de frontend (HTML, CSS, JS, algo de React) y
> backend (Python, FastAPI, PostgreSQL), además del uso de contenedores y de la propia
> IA como herramienta de programación. La IA asiste y enseña; **no sustituye el trabajo
> del dueño del repo.**

---

## 2. Stack permitido

| Capa | Tecnología | Regla |
|------|-----------|-------|
| Frontend | React (con Vite), HTML, CSS, JavaScript | Componentes simples y legibles. **Prohibido** instalar librerías de componentes (Material-UI, shadcn/ui, Chakra, Bootstrap). CSS escrito a mano. |
| Gráficos | Librería ligera (p. ej. Chart.js) | Solo si el gráfico a mano es demasiado complejo. Justificar la decisión en el PR/commit. |
| Backend | Python 3.12 + FastAPI | Código claro, con type hints. |
| Base de datos | PostgreSQL | Consultas con SQLModel/SQLAlchemy o SQL directo, sin ORM mágico que oculte el SQL. |
| Contenedores | Docker + `docker-compose.yml` | Todo el entorno levantable con `docker compose up`. |
| Control de versiones | Git + GitHub | Historial limpio, paso a paso. |

Cualquier tecnología fuera de esta tabla requiere aprobación explícita del dueño.

---

## 3. Reglas de estilo de código

1. **Legibilidad ante todo.** Este código se va a leer en entrevistas y se va a enseñar.
2. **Comentarios docentes:** cuando el código use un concepto no trivial (hooks de React,
   async/await, schemas de Pydantic, migraciones SQL), añadir un comentario breve que
   explique *qué hace y por qué*.
3. **Nombres descriptivos en inglés** para variables, funciones, archivos y endpoints.
   Comentarios y documentación en español.
4. **Sin abstracciones prematuras.** No crear utilidades "por si acaso". Se duplica
   código antes de inventar una capa extra de indirección.
5. **Commits pequeños y atómicos**, con mensajes en español al estilo
   `tipo: descripción` (ej. `feat: endpoint para listar hábitos del día`).
6. **Nada de código generado a ciegas sin explicar.** Cada cambio no trivial va acompañado
   de una explicación para que el dueño pueda defenderlo y reescribirlo solo.

---

## 4. Reglas de trabajo del agente

1. **Entender antes de actuar.** Si un requisito es ambiguo, preguntar. No inventar
   features.
2. **Confirmar antes de cambios estructurales:** nuevas dependencias, cambios de
   esquema de base de datos, renombrar carpetas o modificar la configuración de build.
3. **Modificar solo lo necesario.** No reescribir archivos completos si el cambio es
   local.
4. **Probar antes de entregar:** el frontend debe compilar (`npm run build`) y el
   backend debe pasar sus tests/lint antes de dar un cambio por terminado.
5. **Explicar el diff.** Al terminar, resumir qué cambió, dónde y por qué.
6. **Transparencia total:** si algo fue generado por IA, se marca como tal en el
   commit o en `docs/`.
7. **Nunca tocar** el historial de Git publicado (`force push` prohibido a `main`).

---

## 5. Estructura del repositorio (objetivo)

```
/
├── AGENTS.md              ← este archivo
|-- MEMORY.md              ← Memoria del Proyecto
├── README.md              ← descripción del proyecto y cómo correrlo
├── docs/                  ← notas de aprendizaje, decisiones (ADR), bitácora
├── frontend/              ← React + Vite (HTML/CSS/JS a mano)
├── backend/               ← FastAPI (app/routers/models/schemas/tests)
├── docker-compose.yml     ← PostgreSQL + backend + frontend
└── .github/               ← (opcional) CI mínimo
```

La estructura puede evolucionar, pero cada cambio se propone y justifica primero.

---

## 6. Flujo de trabajo

1. Trabajar en **ramas cortas** (`feature/habitos`, `fix/endpoint-habitos`, ...).
2. Un **commit por paso lógico**, idealmente pequeño y comprensible.
3. Antes de mergear a `main`: frontend compila, backend responde, y el dueño revisó.
4. El dueño del repo decide qué se mergea. La IA propone, no impone.
5. Actualizar `README.md` y `docs/` cuando el proyecto cambie lo suficiente.

---

## 7. Comandos del día a día

```bash
# Base de datos + backend + frontend con Docker
docker compose up --build

# Backend sin Docker (Python local + PostgreSQL en Docker)
cd backend && uvicorn app.main:app --reload --port 8000

# Frontend
cd frontend && npm install && npm run dev

# Tests del backend
cd backend && pytest
```

---

## 8. Definición de "terminado"

Una tarea está terminada cuando:

- [ ] Cumple el requisito pedido (nada más, nada menos).
- [ ] Frontend compila sin errores y backend levanta sin traceback.
- [ ] Hay un test o una verificación manual documentada del cambio.
- [ ] El dueño entiende qué se hizo y por qué.

---

## 9. Memoria
- Al empezar, lee `MEMORY.md` para conocer el estado del proyecto y las decisiones tomadas.
- Al terminar una tarea, actualízalo: estado actual, decisiones importantes (con su porqué) y errores a evitar.
- Mantenlo breve (máximo ~50 líneas): resume o elimina lo que ya no aporte.
- Si algo se convierte en una regla permanente, propón moverlo a `AGENTS.md` en lugar de dejarlo en la memoria.
- No guardes nunca datos sensibles (claves, tokens, datos personales). 

---

*Proyecto de aprendizaje de Fer — con ayuda de IA, un paso a la vez.*
