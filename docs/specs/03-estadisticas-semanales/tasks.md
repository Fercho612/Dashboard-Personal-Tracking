# Tareas 03 — Estadísticas
Plan: `plan.md`. Orden de dependencia; una tarea a la vez (tests en rojo → código → verde → marcar → parar).
Todas las pruebas usan fechas fijas, nunca el «hoy» real.

- [x] **T1. Rangos del período y del período anterior.** RF-2, RF-7, RNF-1
 - Hecho cuando: `getPeriodRange` y `getPreviousRange` pasan tests de semana (un lunes y un domingo), mes (incluido hoy = 31 con el mes pasado de 30 días) y 90 días. Se exporta `getScheduledHabits` y los tests de hábitos siguen en verde.

- [x] **T2. Oportunidades por día y tasa de un rango.** RF-6, RF-8, RF-9, RF-18
 - Hecho cuando: `getDayStats` y `getRangeStats` pasan tests de día futuro, hoy pendiente vs. hecho, hábito con días concretos, registro en día no programado, hábito nuevo y registro retroactivo, y rango sin oportunidades (`rate = null`).

- [x] **T3. Días perfectos y racha global dentro del período.** RF-10, RF-11
 - Hecho cuando: `getPerfectDays` pasa tests de racha que empieza antes del rango, días sin oportunidades que no cortan, y hoy incompleto.

- [x] **T4. Datos de la matriz y niveles.** RF-12, RF-13, RF-14, RF-15
 - Hecho cuando: `getRateLevel` pasa los bordes (0, 1, 33, 34, 66, 67, 99, 100, `null`) y `getMatrixWeeks` devuelve 17 columnas de 7 días con la última semana marcando los días futuros.

- [x] **T5. Datos de barras y ranking.** RF-16, RF-17, RF-18, RF-19, RF-20
 - Hecho cuando: `getBars` agrupa por día en «semana» y por semana recortada en «mes» y «90 días», y `getHabitRanking` ordena por tasa con desempate alfabético y excluye hábitos sin oportunidades.

- [x] **T6. Sección Estadísticas con selectores y estado vacío.** RF-1, RF-2, RF-3, RF-4, RF-5, RF-21, RF-22, RF-23
 - Hecho cuando: «Estadísticas» se habilita en la sidebar y abre la página; los selectores de período y de hábito están en la cabecera; sin hábitos aparece el estado vacío con «Ir a Hábitos»; los datos se leen sin escribir (con JSON corrupto no se modifica `localStorage`); si el hábito filtrado ya no existe, vuelve a «Todos los hábitos». `npm run build` en verde.

- [x] **T7. Tarjetas de cumplimiento y de constancia.** RF-6, RF-7, RF-8, RF-9, RF-10, RF-11
 - Hecho cuando: con datos de ejemplo se ve «X de Y», la diferencia con signo, «—» sin oportunidades, «Sin datos del período anterior» y «N de M días perfectos», y cambian al cambiar de período.

- [x] **T8. Matriz de constancia con detalle.** RF-12, RF-13, RF-14, RF-15, RNF-3
 - Hecho cuando: se ven 17 semanas con los meses arriba y la leyenda «Menos … Más»; al pasar el mouse o enfocar con Tab una celda aparece la fecha y «N de M hábitos»; los días futuros y sin hábitos se ven distintos de 0 %.

- [x] **T9. Barras por día/semana y ranking.** RF-16, RF-17, RF-18, RF-19, RF-20, RNF-3
 - Hecho cuando: «Esta semana» muestra 7 barras y «Mes»/«90 días» barras semanales con el % como etiqueta; las barras sin datos muestran «—» y el ranking muestra nombre, tasa y «X de Y».

- [x] **T10. Estilos responsive, verificación y documentación.** RNF-4, RNF-5, RNF-6
 - Hecho cuando: a 1300 px y a 400 px no hay scroll horizontal de la página (solo la matriz); `npm test` y `npm run build` en verde; la prueba con 20 hábitos y 1 año de registros no muestra demora; la spec pasa a «implementada» y `MEMORY.md` y `docs/` quedan actualizados.
