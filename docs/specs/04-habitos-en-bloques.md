# Spec 04 — Hábitos en bloques
Estado: aprobada

> Spec redactada con asistencia de IA (Claude) a partir de las respuestas del dueño.

## Contexto y objetivo
El calendario semanal planifica *cuándo* se hace cada cosa y la sección Hábitos registra
*qué* se cumple, pero hoy no están conectados. El objetivo es poder indicar qué hábitos
se practican dentro de un bloque (p. ej. "Meditación" y "Lectura" en el bloque "Rutina de
mañana"), para que la planificación semanal muestre dónde encaja cada hábito.
Es **solo una referencia visual**: no cambia cómo se marcan los hábitos ni sus métricas.

## Usuarios
El dueño del dashboard, como único usuario, que planifica su semana y registra hábitos.

## Historias de usuario
- HU-1. Como usuario, quiero asignar hábitos ya creados a un bloque para ver en mi semana cuándo practico cada hábito.
- HU-2. Como usuario, quiero quitar un hábito de un bloque para corregir mi planificación.
- HU-3. Como usuario, quiero que me avisen si asigno un hábito a un día en que no le toca, para detectar incoherencias sin que me lo impidan.

## Definiciones
- **Hábito asignado:** hábito existente vinculado a un bloque. Un bloque puede tener cero o más; un hábito puede estar en cero o más bloques.
- **Le toca ese día:** la frecuencia del hábito incluye el día de la semana del bloque (misma regla que en la spec 01).

## Requisitos funcionales
- RF-1: EL SISTEMA mostrará en el panel de creación/edición de un bloque una sección de hábitos con la lista de hábitos asignados y la etiqueta "Agregar hábito:" seguida de un botón con la forma y el tamaño de los botones de la app, pero en el verde que la app usa para "hecho", que muestra un símbolo "+" y tiene el nombre accesible "Agregar hábito".
- RF-2: CUANDO el usuario pulse el botón "+" de "Agregar hábito:", EL SISTEMA mostrará un selector con los hábitos existentes que todavía no están asignados a ese bloque.
- RF-3: CUANDO el usuario elija un hábito en el selector, EL SISTEMA lo añadirá al final de la lista de hábitos asignados del bloque y cerrará el selector. Para agregar otro, se vuelve a pulsar el botón "+".
- RF-4: CUANDO el usuario pulse quitar en un hábito asignado, EL SISTEMA lo eliminará de la lista del bloque, sin pedir confirmación y sin afectar al hábito.
- RF-5: Los cambios en los hábitos asignados se guardan junto con el resto del bloque: CUANDO el usuario guarde el panel, EL SISTEMA los persistirá; CUANDO lo cierre o cancele sin guardar, EL SISTEMA los descartará.
- RF-6: SI la frecuencia de un hábito asignado no incluye el día del bloque, ENTONCES EL SISTEMA mostrará junto a ese hábito, en el panel, el aviso "No le toca este día", sin impedir la asignación ni el guardado.
- RF-7: EL SISTEMA permitirá asignar el mismo hábito a varios bloques, de uno o de varios días.
- RF-8: SI no existe ningún hábito creado, ENTONCES EL SISTEMA mostrará en la sección de hábitos del panel el mensaje "Todavía no tienes hábitos" con un acceso a la sección Hábitos, en lugar del selector.
- RF-9: SI todos los hábitos existentes ya están asignados al bloque, ENTONCES EL SISTEMA deshabilitará el botón "+" e indicará que no quedan hábitos por agregar.
- RF-10: EL SISTEMA mostrará los hábitos asignados solo en el panel del bloque; la grilla no cambia y los bloques se ven igual que hoy.
- RF-11: CUANDO se renombre un hábito, EL SISTEMA mostrará el nuevo nombre en el panel de todos los bloques donde está asignado.
- RF-12: CUANDO el usuario pida borrar un hábito asignado a uno o más bloques, EL SISTEMA indicará en la confirmación en cuántos bloques está (p. ej. "Está en 3 bloques del calendario").
- RF-13: CUANDO el usuario confirme el borrado de ese hábito, EL SISTEMA lo quitará de todos los bloques, sin modificar ni borrar los bloques.
- RF-14: EL SISTEMA no modificará el registro de cumplimiento, las métricas ni las Estadísticas por asignar o quitar hábitos de bloques.

## Requisitos no funcionales
- RNF-1: Los datos de calendario guardados antes de esta funcionalidad se cargarán sin errores ni pérdidas; sus bloques empezarán sin hábitos asignados (constitución, principio 5).
- RNF-2: SI un bloque guardado referencia un hábito que ya no existe, ENTONCES EL SISTEMA lo ignorará al mostrarlo, sin romper la app ni borrar el resto de los datos.
- RNF-3: Todo el texto visible en español. El selector y el botón quitar son usables con teclado y tienen nombre accesible ("Quitar Meditación del bloque").
- RNF-4: A 400px de ancho la sección de hábitos del panel se puede usar sin scroll horizontal.

## Casos límite
- Bloque con muchos hábitos asignados → la lista del panel crece hacia abajo y se puede desplazar; la grilla no cambia.
- Bloque nuevo (aún sin guardar) → se le pueden asignar hábitos antes de guardarlo por primera vez.
- Cambiar el día de un bloque → los avisos de RF-6 se recalculan con el nuevo día.
- Editar la frecuencia de un hábito → los avisos se recalculan; la asignación no cambia.
- Borrar un bloque → sus asignaciones desaparecen con él; los hábitos no se tocan.

## Fuera de alcance
- Marcar un hábito como hecho desde el calendario.
- Crear un hábito nuevo desde el bloque.
- Reordenar los hábitos dentro de un bloque.
- Ver desde la sección Hábitos en qué bloques está cada hábito.
- Filtrar la grilla por hábito.
- Mostrar los hábitos o el botón de agregar dentro de los bloques de la grilla.

## Criterios de finalización
- [ ] Puedo asignar y quitar hábitos desde el panel de un bloque, y al recargar siguen ahí.
- [ ] Cancelar el panel descarta los cambios de hábitos.
- [ ] El panel muestra "Agregar hábito:" con el botón verde "+"; la grilla se ve igual que antes.
- [ ] Asignar un hábito a un día en que no le toca muestra el aviso y permite guardar.
- [ ] Borrar un hábito asignado avisa cuántos bloques tiene y lo quita de todos ellos.
- [ ] Sin hábitos creados, aparece el mensaje con el acceso a la sección Hábitos.
- [ ] Los datos de calendario anteriores cargan sin errores.
- [ ] La matriz de Hábitos y las Estadísticas no cambian al asignar o quitar.
- [ ] Build y tests en verde.

## Dudas abiertas
- Ninguna. (Resuelta: el selector agrega los hábitos de a uno.)
