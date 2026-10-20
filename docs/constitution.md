# Constitución de HabitFlow
Principios innegociables. Si un cambio choca con uno, se cambia el cambio o se enmienda esto con aprobación del dueño.

1. **Stack mínimo.** Frontend: React + Vite, HTML, CSS escrito a mano y JavaScript. Backend: Python + FastAPI + PostgreSQL, en Docker. Nada fuera de esta lista, y ninguna dependencia nueva en `package.json` sin aprobación explícita del dueño. Verificable: el diff de `package.json` está vacío o aprobado.
2. **Spec antes que código.** Toda funcionalidad tiene su spec aprobada en `docs/specs/` antes de implementarse, y si el código se aparta de ella, se actualiza la spec en el mismo PR. Verificable: cada PR de feature enlaza su spec.
3. **Lógica separada de la interfaz.** Los cálculos y reglas viven en módulos `.js` puros (sin React ni `localStorage`), y la persistencia solo en los hooks `use*.js`. Los componentes `.jsx` solo muestran datos y llaman acciones. Verificable: ningún `.jsx` importa `localStorage` ni hace cálculos de dominio.
4. **Tests con lo que ya hay.** Toda función de lógica pura nueva o modificada tiene su `*.test.js` con Vitest, y nada más se instala para testear. Las fechas en los tests son fijas, nunca el "hoy" real. Verificable: `npm test` y `npm run build` pasan.
5. **Los datos del usuario son sagrados.** Ninguna acción borra datos sin confirmación. Un JSON corrupto o viejo no rompe la app ni se sobrescribe sin leerlo, y si cambia el formato guardado cambia la versión de la clave (`*.v2`) con migración. No se envía ningún dato fuera del navegador sin una spec aprobada.
6. **Idioma.** Código (variables, funciones, archivos, endpoints) en inglés. Comentarios, docs, commits y todo texto visible en la interfaz en español. Verificable: revisión del diff.
