# Spec 05 — Reordenar hábitos
Estado: implementada

## Contexto y objetivo
Hoy la lista de Hábitos tiene un orden fijo: el de creación. Quien tiene varios hábitos quiere verlos en el orden que le resulta útil (por ejemplo, los más importantes arriba) y hoy no puede cambiarlo. El objetivo es que cada persona pueda ordenar su lista de hábitos arrastrándolos, y que ese orden se conserve.

## Usuarios
- Persona que usa HabitFlow para registrar sus hábitos, desde computadora o desde el celular.
- Persona que usa la app con teclado, sin mouse.

## Historias de usuario
- HU-1. Como persona con varios hábitos, quiero arrastrar un hábito a otra posición de la lista para ordenarlos como me conviene.
- HU-2. Como persona que usa el celular, quiero poder arrastrar con el dedo para reordenar sin depender de un mouse.
- HU-3. Como persona que usa teclado, quiero subir o bajar un hábito sin arrastrar para poder reordenar igual que quien usa mouse.
- HU-4. Como persona que reordena, quiero que el orden se mantenga al cerrar y volver a abrir la app para no tener que repetirlo.

## Definiciones
- **Lista de Hábitos:** la pantalla donde se ven y se administran todos los hábitos.
- **Orden:** la posición de cada hábito en la lista de Hábitos, de arriba hacia abajo.

## Requisitos funcionales
- RF-1: CUANDO la persona arrastra un hábito de la lista de Hábitos y lo suelta en otra posición de esa misma lista, EL SISTEMA coloca el hábito en esa posición y desplaza a los demás sin cambiar su orden relativo.
- RF-2: MIENTRAS la persona arrastra un hábito, EL SISTEMA muestra de forma visible cuál hábito se está moviendo y en qué posición quedaría si lo soltara.
- RF-3: EL SISTEMA permite reordenar con el dedo en pantallas táctiles con el mismo resultado que con el mouse.
- RF-4: EL SISTEMA ofrece una alternativa por teclado para mover un hábito una posición hacia arriba o hacia abajo, sin arrastrar.
- RF-5: CUANDO la persona sube un hábito que ya está primero, o baja uno que ya está último, EL SISTEMA no cambia el orden.
- RF-6: CUANDO el orden cambia, EL SISTEMA lo guarda de inmediato, y al cerrar y volver a abrir la app la lista aparece en ese orden.
- RF-7: CUANDO la persona crea un hábito nuevo, EL SISTEMA lo coloca al final de la lista de Hábitos.
- RF-8: EL SISTEMA conserva el orden actual de los hábitos ya existentes (el de creación) hasta que la persona lo cambie, sin perder ningún hábito ni registro.
- RF-9: CUANDO la persona borra un hábito, EL SISTEMA mantiene el orden relativo de los hábitos restantes.
- RF-10: SI la persona suelta el hábito fuera de la lista de Hábitos o pulsa Escape durante el arrastre, ENTONCES EL SISTEMA cancela el movimiento y deja el orden como estaba.
- RF-11: SI no se puede guardar el nuevo orden, ENTONCES EL SISTEMA vuelve al orden anterior y muestra un aviso en español que lo explica.
- RF-12: EL SISTEMA muestra los hábitos en el orden elegido en todas las pantallas que los ofrecen o listan en el orden de la lista (opciones del «+» del panel del bloque, filtro de Estadísticas); el ranking de Estadísticas sigue ordenado por desempeño, y los hábitos ya asignados a un bloque conservan su orden de asignación.

## Requisitos no funcionales
- RNF-1: Reordenar no modifica los registros de cumplimiento ni las métricas de ningún hábito: antes y después de mover un hábito, sus datos son idénticos.
- RNF-2: Todo texto visible nuevo (avisos, nombres de las acciones de teclado) está en español.
- RNF-3: La función se puede usar con la misma facilidad en un ancho de pantalla de 400 px que en escritorio.
- RNF-4: Cada acción de reordenar por teclado se puede completar solo con teclado y quien usa lector de pantalla recibe el anuncio de la nueva posición del hábito.

## Casos límite
- Con un solo hábito, no hay nada que reordenar y la función no produce cambios ni errores.
- Con cero hábitos, la lista vacía se muestra como hoy.
- Soltar un hábito en su misma posición no cambia el orden ni cuenta como cambio.
- Si hay datos guardados corruptos o de una versión anterior, la app no se rompe ni los sobrescribe al leerlos (constitución, principio 5).
- Un arrastre accidental muy corto (un clic o un toque sin mover) no reordena nada ni abre ni marca el hábito.

## Fuera de alcance
- Cambiar el orden de asignación de los hábitos dentro de un bloque, o el del ranking de Estadísticas.
- Mover hábitos entre bloques del calendario, o arrastrarlos desde la lista hacia un bloque.
- Ordenar automáticamente (por nombre, por racha, por fecha) o botones de ordenar.
- Elegir la posición de un hábito al crearlo.
- Reordenar categorías, bloques u otros elementos que no sean hábitos.
- Deshacer el último movimiento.
- Enviar o sincronizar el orden fuera del navegador.

## Criterios de finalización
- Se cumplen RF-1 a RF-12 y RNF-1 a RNF-4.
- Con tres hábitos A, B y C, arrastrar C encima de A deja el orden C, A, B, y sigue así tras recargar la app.
- Subir A cuando ya está primero no cambia nada.
- Un usuario con hábitos creados antes de esta función ve la lista en el mismo orden que antes de actualizar.
- Un movimiento cancelado (Escape o soltar fuera) deja el orden idéntico al anterior.
- Funciona con mouse, con el dedo y con teclado.

## Dudas abiertas
Ninguna.
