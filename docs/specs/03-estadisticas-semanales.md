# Spec 03 — Estadísticas
Estado: implementada

> Referencia visual: diseño «Estadísticas y analíticas de productividad» (adaptado: solo hábitos).
> Spec redactada con asistencia de IA (Claude) a partir de las respuestas del dueño.

## Contexto y objetivo
La sección Estadísticas aparece en la navegación, pero está deshabilitada. Hoy las métricas de
hábitos se limitan al día de hoy, la racha y la consistencia de los últimos 30 días. El objetivo es
que el usuario vea **cómo evoluciona su constancia** en un período (semana, mes o 90 días),
lo compare con el período anterior y detecte qué días y qué hábitos le cuestan más.
Esta versión usa **solo los datos de hábitos**: el calendario es una plantilla sin fechas reales.

## Usuarios
El dueño del dashboard (uso personal, un solo usuario, sin cuenta).

## Historias de usuario
- HU-1. Como usuario, quiero ver mi tasa de cumplimiento del período y su diferencia con el período anterior para saber si estoy mejorando.
- HU-2. Como usuario, quiero elegir entre Esta semana, Este mes y Últimos 90 días para mirar mi progreso a distintas escalas.
- HU-3. Como usuario, quiero ver mi mejor racha y mis días perfectos del período para valorar mi constancia.
- HU-4. Como usuario, quiero un mapa de calor de los últimos meses para detectar rachas y huecos de un vistazo.
- HU-5. Como usuario, quiero ver el cumplimiento por día (o por semana) y un ranking de hábitos para saber qué días y qué hábitos fallo más.
- HU-6. Como usuario, quiero filtrar todas las estadísticas por un único hábito para analizarlo por separado.

## Definiciones
- **Día programado de un hábito:** día en que el hábito toca según su frecuencia y que no es anterior a su inicio (su fecha de creación, o su primer registro si se marcó algo de forma retroactiva). Es la misma regla que en la sección Hábitos.
- **Oportunidad:** un par (hábito, día programado). **Cumplida** si ese día está marcado como hecho. Los registros en días no programados no cuentan.
- **Hoy:** cuenta como oportunidad solo si ya está cumplida. Así el día en curso no penaliza, igual que en la consistencia de Hábitos. Los días futuros nunca cuentan.
- **Tasa de cumplimiento:** oportunidades cumplidas / oportunidades del período, en % redondeado a entero.
- **Período:**
  - *Esta semana*: del lunes de la semana actual hasta hoy.
  - *Este mes*: del día 1 del mes actual hasta hoy.
  - *Últimos 90 días*: hoy y los 89 días anteriores.
- **Período anterior (para comparar):** el mismo tramo, desplazado un período hacia atrás.
  - *Semana*: del lunes al mismo día de la semana, pero de la semana pasada.
  - *Mes*: del día 1 al mismo número de día del mes pasado. Si el mes pasado tiene menos días, se corta en su último día.
  - *90 días*: los 90 días inmediatamente anteriores.
- **Día perfecto:** día con al menos una oportunidad, en el que todas sus oportunidades están cumplidas.
- **Racha global:** días perfectos consecutivos. Los días sin ninguna oportunidad se saltean (ni suman ni cortan), como en Hábitos.
- **Matriz de constancia:** grilla de 17 semanas (≈ 4 meses). Cada columna es una semana de lunes a domingo y la última es la semana actual. Cada fila es un día de la semana.

## Requisitos funcionales

**Navegación y período**
- RF-1: CUANDO el usuario elige «Estadísticas» en la navegación, EL SISTEMA muestra la sección de estadísticas.
- RF-2: EL SISTEMA ofrece un selector con tres períodos: «Esta semana», «Este mes» y «Últimos 90 días». Al entrar en la sección, el seleccionado es «Esta semana».
- RF-3: CUANDO el usuario cambia el período, EL SISTEMA recalcula la tarjeta de cumplimiento, la tarjeta de constancia, las barras y el ranking con el nuevo período. La matriz no cambia.

**Filtro por hábito**
- RF-4: EL SISTEMA ofrece en la cabecera de la sección, junto al selector de período, un selector con «Todos los hábitos» (por defecto) y cada hábito por su nombre.
- RF-5: MIENTRAS hay un hábito seleccionado, EL SISTEMA calcula todos los paneles (incluida la matriz) solo con las oportunidades de ese hábito, y el ranking muestra solo ese hábito.

**Tarjeta de tasa de cumplimiento**
- RF-6: EL SISTEMA muestra la tasa de cumplimiento del período y debajo «X de Y» (cumplidas / oportunidades).
- RF-7: EL SISTEMA muestra la diferencia con el período anterior en puntos porcentuales y con signo (p. ej. «+6 pts», «−3 pts», «0 pts»).
- RF-8: SI el período actual no tiene oportunidades, ENTONCES EL SISTEMA muestra «—» en lugar de la tasa y no muestra la diferencia.
- RF-9: SI el período anterior no tiene oportunidades, ENTONCES EL SISTEMA muestra «Sin datos del período anterior» en lugar de la diferencia.

**Tarjeta de constancia**
- RF-10: EL SISTEMA muestra la racha global más larga dentro del período, en días. Una racha que empezó antes del período solo suma los días que caen dentro.
- RF-11: EL SISTEMA muestra la cantidad de días perfectos del período sobre los días del período con al menos una oportunidad (p. ej. «4 de 6 días perfectos»).

**Matriz de constancia**
- RF-12: EL SISTEMA muestra la matriz de las últimas 17 semanas, con los nombres de los meses encima de las columnas donde empieza cada mes.
- RF-13: EL SISTEMA colorea cada día según su tasa de cumplimiento, en 5 niveles: 0 %, 1–33 %, 34–66 %, 67–99 % y 100 %. Una leyenda «Menos … Más» explica los niveles.
- RF-14: EL SISTEMA muestra con un estilo distinto de «0 %» los días sin oportunidades y los días futuros de la semana actual.
- RF-15: CUANDO el usuario pasa el puntero o enfoca con el teclado un día de la matriz, EL SISTEMA muestra la fecha y «N de M hábitos», o «Sin hábitos programados» si no tiene oportunidades.

**Barras de cumplimiento**
- RF-16: MIENTRAS el período es «Esta semana», EL SISTEMA muestra una barra por día de lunes a domingo, con la tasa del día como altura y el % como etiqueta.
- RF-17: MIENTRAS el período es «Este mes» o «Últimos 90 días», EL SISTEMA muestra una barra por semana (de lunes a domingo, recortada a los límites del período), con la tasa de esa semana y la fecha de su lunes como etiqueta.
- RF-18: EL SISTEMA muestra los días futuros y los días o semanas sin oportunidades como una barra vacía con la etiqueta «—», sin contarlos como 0 %.

**Ranking de hábitos**
- RF-19: EL SISTEMA lista los hábitos que tienen al menos una oportunidad en el período, ordenados por tasa de cumplimiento de mayor a menor. Los empates se ordenan por nombre alfabéticamente.
- RF-20: EL SISTEMA muestra en cada fila el nombre del hábito, su tasa y «X de Y».

**Estados vacíos y errores**
- RF-21: SI no existe ningún hábito, ENTONCES EL SISTEMA muestra un estado vacío con un mensaje y un acceso a la sección Hábitos, en lugar de los paneles.
- RF-22: SI los datos guardados de hábitos están corruptos o no se pueden leer, ENTONCES EL SISTEMA muestra el mismo comportamiento que la sección Hábitos ante ese caso, sin romper la página ni modificar los datos.

**Solo lectura**
- RF-23: EL SISTEMA no modifica ningún dato de hábitos desde esta sección.

## Requisitos no funcionales
- RNF-1: Los cálculos de estadísticas reciben la fecha de «hoy» como dato de entrada, para poder probarse con fechas fijas (constitución, principio 4).
- RNF-2: Todas las fechas se interpretan en hora local, nunca en UTC.
- RNF-3: El color nunca es la única pista. Cada barra muestra su %, la matriz tiene leyenda y detalle accesible por teclado, y el ranking muestra números.
- RNF-4: A 400 px de ancho la sección se puede usar sin scroll horizontal de la página. La matriz puede tener su propio scroll horizontal.
- RNF-5: Todo texto visible está en español.
- RNF-6: Con 20 hábitos y 1 año de registros, cambiar de período o de filtro actualiza los paneles sin una demora perceptible (menos de 100 ms en un equipo de escritorio).
- RNF-7: No se instala ninguna dependencia nueva sin aprobación del dueño. Si hace falta una librería de gráficos, se justifica y se aprueba en el plan.

## Casos límite
- Hoy es lunes y todavía no hay nada hecho: la semana no tiene oportunidades (RF-8) y las barras de lunes a domingo muestran «—».
- Hoy es 31 y el mes pasado tuvo 30 días: el período anterior va del 1 al 30.
- Un hábito creado a mitad del período solo aporta oportunidades desde su inicio.
- Un hábito con días concretos (p. ej. L-M-V): los otros días no son oportunidades de ese hábito.
- Un registro en un día no programado no suma en ninguna métrica.
- Se borra el hábito filtrado mientras se ve la sección, o ya no existe al volver: el filtro vuelve a «Todos los hábitos».
- Un hábito sin oportunidades en el período no aparece en el ranking. Si el filtro apunta a él, los paneles muestran «—».
- Un registro retroactivo anterior a la creación adelanta el inicio del hábito, igual que en Hábitos.
- Los días de la matriz anteriores al inicio de todos los hábitos se ven como «sin oportunidades».

## Fuera de alcance
- Métricas de horas: foco profundo, distribución de horas por día y balance por categoría (el calendario no registra horas reales).
- El botón «Exportar reporte».
- Recordar el período o el filtro elegidos al recargar o volver a la sección.
- Rangos de fechas personalizados y navegación a semanas o meses pasados concretos.
- Insignias motivacionales («Imparable», «Meta lograda») y metas configurables.
- Clic en un día de la matriz para editarlo.
- Backend, modo claro y buscador.

## Criterios de finalización
- [x] Todos los RF se cumplen y se verifican a mano con datos de ejemplo.
- [x] Hay tests con fechas fijas de: tasa del período, diferencia con el período anterior (incluido el mes pasado más corto), día perfecto, racha global dentro del período, niveles de la matriz, agrupación semanal de las barras y orden del ranking con empates.
- [x] Los tests existentes de hábitos y calendario siguen pasando, y el proyecto compila.
- [x] Se verificó a 1300 px y a 400 px de ancho.
- [ ] El dueño revisó y aprobó la spec y el resultado.

## Dudas abiertas
- Ninguna. (Resuelta: el selector de hábito va en la cabecera, junto al de período.)

## Verificación realizada
- `npm run build` sin errores y `npm test` con 102 tests en verde (54 nuevos de `statsUtils`, con fechas fijas).
- Prueba automatizada en Edge headless (19 comprobaciones) con datos de ejemplo: estado vacío y botón «Ir a Hábitos», selector de período y de hábito, matriz de 17×7 con meses y detalle al enfocar, barras por día y por semana, ranking, y que la sección no escribe nada en `localStorage` (RF-23).
- Rendimiento: con 20 hábitos y 1 año de registros, cambiar de período tarda ~30 ms.
- Capturas revisadas a 1300 px y a 400 px de ancho (iframe de 400 px, sin scroll horizontal de la página).

### Decisiones tomadas durante la implementación
- **Lectura sin escritura:** Estadísticas usa `useStatsData`, que reutiliza `loadState` de `useHabits` pero nunca guarda. `useHabits` escribía al montarse y pisaba un JSON corrupto; ya está corregido (solo guarda tras la primera acción del usuario).
- **Barras con scroll propio:** con muchas barras semanales y poco ancho, cada barra tiene un ancho mínimo y el gráfico hace scroll dentro de su tarjeta, para que las etiquetas no se pisen.
- **Celdas de la matriz acotadas** a un ancho máximo para que no se agranden en pantallas anchas.
