import { describe, expect, it } from 'vitest'
import {
  getBars,
  getDayStats,
  getHabitRanking,
  getMatrixMonthLabels,
  getMatrixWeeks,
  getPerfectDays,
  getPeriodRange,
  getPreviousRange,
  getRangeStats,
  getRateLevel,
} from './statsUtils.js'
import { fromDateKey, toDateKey } from '../../lib/dates.js'

// Convierte un rango de Dates a claves "YYYY-MM-DD" para comparar fácil.
const keys = (range) => [toDateKey(range.start), toDateKey(range.end)]

describe('getPeriodRange', () => {
  it('semana: del lunes hasta hoy', () => {
    // 2026-10-21 es miércoles
    expect(keys(getPeriodRange('week', fromDateKey('2026-10-21')))).toEqual(['2026-10-19', '2026-10-21'])
  })

  it('semana: si hoy es lunes, el rango es solo hoy', () => {
    expect(keys(getPeriodRange('week', fromDateKey('2026-10-19')))).toEqual(['2026-10-19', '2026-10-19'])
  })

  it('semana: si hoy es domingo, el rango es la semana completa', () => {
    expect(keys(getPeriodRange('week', fromDateKey('2026-10-25')))).toEqual(['2026-10-19', '2026-10-25'])
  })

  it('mes: del día 1 hasta hoy', () => {
    expect(keys(getPeriodRange('month', fromDateKey('2026-10-21')))).toEqual(['2026-10-01', '2026-10-21'])
  })

  it('90 días: hoy y los 89 anteriores', () => {
    expect(keys(getPeriodRange('90days', fromDateKey('2026-10-21')))).toEqual(['2026-07-24', '2026-10-21'])
  })
})

describe('getPreviousRange', () => {
  it('semana: mismo tramo de la semana pasada', () => {
    // Lunes→miércoles de esta semana ↔ lunes→miércoles de la anterior
    expect(keys(getPreviousRange('week', fromDateKey('2026-10-21')))).toEqual(['2026-10-12', '2026-10-14'])
  })

  it('semana: si hoy es lunes, compara contra el lunes anterior', () => {
    expect(keys(getPreviousRange('week', fromDateKey('2026-10-19')))).toEqual(['2026-10-12', '2026-10-12'])
  })

  it('semana: si hoy es domingo, compara contra la semana pasada completa', () => {
    expect(keys(getPreviousRange('week', fromDateKey('2026-10-25')))).toEqual(['2026-10-12', '2026-10-18'])
  })

  it('mes: del día 1 al mismo número de día del mes pasado', () => {
    expect(keys(getPreviousRange('month', fromDateKey('2026-10-21')))).toEqual(['2026-09-01', '2026-09-21'])
  })

  it('mes: hoy es 31 y el mes pasado tuvo 30 días → se corta en el 30', () => {
    expect(keys(getPreviousRange('month', fromDateKey('2026-10-31')))).toEqual(['2026-09-01', '2026-09-30'])
  })

  it('mes: hoy es 31 de marzo y febrero tuvo 28 días → se corta en el 28', () => {
    expect(keys(getPreviousRange('month', fromDateKey('2026-03-31')))).toEqual(['2026-02-01', '2026-02-28'])
  })

  it('mes: en enero el mes pasado es diciembre del año anterior', () => {
    expect(keys(getPreviousRange('month', fromDateKey('2026-01-15')))).toEqual(['2025-12-01', '2025-12-15'])
  })

  it('90 días: los 90 días inmediatamente anteriores', () => {
    expect(keys(getPreviousRange('90days', fromDateKey('2026-10-21')))).toEqual(['2026-04-25', '2026-07-23'])
  })
})

// --- Oportunidades y tasa ---------------------------------------------------

// "Hoy" fijo: 2026-10-21 es miércoles.
const TODAY = fromDateKey('2026-10-21')

const dailyHabit = (overrides = {}) => ({
  id: 'daily',
  name: 'Meditar',
  frequency: { type: 'daily' },
  createdAt: '2026-10-01',
  ...overrides,
})

// Lunes (1), miércoles (3) y viernes (5)
const mwfHabit = (overrides = {}) => ({
  id: 'mwf',
  name: 'Gym',
  frequency: { type: 'weekdays', days: [1, 3, 5] },
  createdAt: '2026-10-01',
  ...overrides,
})

const day = (key) => fromDateKey(key)

describe('getDayStats', () => {
  it('un día futuro no tiene oportunidades', () => {
    expect(getDayStats([dailyHabit()], {}, day('2026-10-22'), TODAY)).toEqual({ done: 0, total: 0 })
  })

  it('hoy pendiente no cuenta como oportunidad', () => {
    expect(getDayStats([dailyHabit()], {}, TODAY, TODAY)).toEqual({ done: 0, total: 0 })
  })

  it('hoy hecho sí cuenta', () => {
    const completions = { daily: ['2026-10-21'] }
    expect(getDayStats([dailyHabit()], completions, TODAY, TODAY)).toEqual({ done: 1, total: 1 })
  })

  it('hoy: solo cuentan los hábitos ya hechos', () => {
    const habits = [dailyHabit(), dailyHabit({ id: 'read', name: 'Leer' })]
    const completions = { daily: ['2026-10-21'] }
    expect(getDayStats(habits, completions, TODAY, TODAY)).toEqual({ done: 1, total: 1 })
  })

  it('un día pasado pendiente cuenta como oportunidad no cumplida', () => {
    expect(getDayStats([dailyHabit()], {}, day('2026-10-20'), TODAY)).toEqual({ done: 0, total: 1 })
  })

  it('un hábito con días concretos solo aporta en sus días', () => {
    expect(getDayStats([mwfHabit()], {}, day('2026-10-20'), TODAY)).toEqual({ done: 0, total: 0 }) // martes
    expect(getDayStats([mwfHabit()], {}, day('2026-10-19'), TODAY)).toEqual({ done: 0, total: 1 }) // lunes
  })

  it('un registro en un día no programado no suma', () => {
    const completions = { mwf: ['2026-10-20'] } // martes
    expect(getDayStats([mwfHabit()], completions, day('2026-10-20'), TODAY)).toEqual({ done: 0, total: 0 })
  })

  it('los días anteriores a la creación del hábito no cuentan', () => {
    const habit = dailyHabit({ createdAt: '2026-10-15' })
    expect(getDayStats([habit], {}, day('2026-10-14'), TODAY)).toEqual({ done: 0, total: 0 })
    expect(getDayStats([habit], {}, day('2026-10-15'), TODAY)).toEqual({ done: 0, total: 1 })
  })

  it('un registro retroactivo adelanta el inicio del hábito', () => {
    const habit = dailyHabit({ createdAt: '2026-10-15' })
    const completions = { daily: ['2026-10-10'] }
    expect(getDayStats([habit], completions, day('2026-10-10'), TODAY)).toEqual({ done: 1, total: 1 })
  })
})

describe('getRangeStats', () => {
  const range = { start: day('2026-10-19'), end: day('2026-10-21') }

  it('suma las oportunidades del rango y redondea la tasa', () => {
    // 19 hecho, 20 pendiente, 21 (hoy) hecho → 2 de 3 = 66,67 % → 67
    const completions = { daily: ['2026-10-19', '2026-10-21'] }
    expect(getRangeStats([dailyHabit()], completions, range, TODAY)).toEqual({ done: 2, total: 3, rate: 67 })
  })

  it('hoy pendiente no baja la tasa', () => {
    const completions = { daily: ['2026-10-19', '2026-10-20'] }
    expect(getRangeStats([dailyHabit()], completions, range, TODAY)).toEqual({ done: 2, total: 2, rate: 100 })
  })

  it('un rango sin oportunidades tiene tasa null', () => {
    expect(getRangeStats([], {}, range, TODAY)).toEqual({ done: 0, total: 0, rate: null })
  })

  it('un rango que llega al futuro ignora los días futuros', () => {
    const wholeWeek = { start: day('2026-10-19'), end: day('2026-10-25') }
    const completions = { daily: ['2026-10-19'] }
    expect(getRangeStats([dailyHabit()], completions, wholeWeek, TODAY)).toEqual({ done: 1, total: 2, rate: 50 })
  })
})

// --- Días perfectos y racha (T3) --------------------------------------------

describe('getPerfectDays', () => {
  const range = { start: day('2026-10-19'), end: day('2026-10-21') }

  it('cuenta los días con todo cumplido y la racha más larga', () => {
    const completions = { daily: ['2026-10-19', '2026-10-20', '2026-10-21'] }
    expect(getPerfectDays([dailyHabit()], completions, range, TODAY)).toEqual({
      perfectDays: 3,
      activeDays: 3,
      longestStreak: 3,
    })
  })

  it('hoy pendiente no es un día activo (ni corta la racha)', () => {
    const completions = { daily: ['2026-10-19', '2026-10-20'] }
    expect(getPerfectDays([dailyHabit()], completions, range, TODAY)).toEqual({
      perfectDays: 2,
      activeDays: 2,
      longestStreak: 2,
    })
  })

  it('un día fallado corta la racha', () => {
    const completions = { daily: ['2026-10-19', '2026-10-21'] }
    expect(getPerfectDays([dailyHabit()], completions, range, TODAY)).toEqual({
      perfectDays: 2,
      activeDays: 3,
      longestStreak: 1,
    })
  })

  it('los días sin oportunidades se saltean: no suman ni cortan', () => {
    // Lunes y miércoles hechos; el martes no le toca al hábito
    const completions = { mwf: ['2026-10-19', '2026-10-21'] }
    expect(getPerfectDays([mwfHabit()], completions, range, TODAY)).toEqual({
      perfectDays: 2,
      activeDays: 2,
      longestStreak: 2,
    })
  })

  it('con varios hábitos, basta uno sin cumplir para que el día no sea perfecto', () => {
    const habits = [dailyHabit(), dailyHabit({ id: 'read', name: 'Leer' })]
    const completions = { daily: ['2026-10-19'], read: [] }
    const monday = { start: day('2026-10-19'), end: day('2026-10-19') }
    expect(getPerfectDays(habits, completions, monday, TODAY)).toEqual({
      perfectDays: 0,
      activeDays: 1,
      longestStreak: 0,
    })
  })

  it('solo cuenta los días dentro del rango aunque la racha empiece antes', () => {
    const completions = {
      daily: ['2026-10-15', '2026-10-16', '2026-10-17', '2026-10-18', '2026-10-19', '2026-10-20'],
    }
    expect(getPerfectDays([dailyHabit()], completions, range, TODAY).longestStreak).toBe(2)
  })

  it('sin hábitos devuelve ceros', () => {
    expect(getPerfectDays([], {}, range, TODAY)).toEqual({ perfectDays: 0, activeDays: 0, longestStreak: 0 })
  })
})

// --- Matriz de constancia (T4) ----------------------------------------------

describe('getRateLevel', () => {
  it.each([
    [null, null],
    [0, 0],
    [1, 1],
    [33, 1],
    [34, 2],
    [66, 2],
    [67, 3],
    [99, 3],
    [100, 4],
  ])('tasa %s → nivel %s', (rate, level) => {
    expect(getRateLevel(rate)).toBe(level)
  })
})

describe('getMatrixWeeks', () => {
  const habit = dailyHabit({ createdAt: '2026-06-01' })

  it('devuelve 17 semanas de 7 días, de lunes a domingo, terminando en la semana actual', () => {
    const weeks = getMatrixWeeks([habit], {}, TODAY)
    expect(weeks).toHaveLength(17)
    expect(weeks.every((week) => week.length === 7)).toBe(true)
    expect(weeks[0][0].key).toBe('2026-06-29')
    expect(weeks[16].map((cell) => cell.key)).toEqual([
      '2026-10-19',
      '2026-10-20',
      '2026-10-21',
      '2026-10-22',
      '2026-10-23',
      '2026-10-24',
      '2026-10-25',
    ])
  })

  it('marca como futuros los días posteriores a hoy', () => {
    const week = getMatrixWeeks([habit], {}, TODAY)[16]
    expect(week.map((cell) => cell.isFuture)).toEqual([false, false, false, true, true, true, true])
  })

  it('calcula nivel, hechos y total de cada día', () => {
    const completions = { daily: ['2026-10-20'] }
    const week = getMatrixWeeks([habit], completions, TODAY)[16]
    expect(week[1]).toMatchObject({ done: 1, total: 1, level: 4 }) // martes 20, hecho
    expect(week[0]).toMatchObject({ done: 0, total: 1, level: 0 }) // lunes 19, no hecho
    expect(week[3]).toMatchObject({ done: 0, total: 0, level: null }) // jueves 22, futuro
  })

  it('un día sin hábitos programados tiene nivel null', () => {
    const week = getMatrixWeeks([mwfHabit({ createdAt: '2026-06-01' })], {}, TODAY)[16]
    expect(week[1].level).toBeNull() // martes: no le toca
  })
})

describe('getMatrixMonthLabels', () => {
  it('etiqueta las columnas que contienen el día 1 de un mes', () => {
    const labels = getMatrixMonthLabels(getMatrixWeeks([], {}, TODAY))
    expect(labels).toHaveLength(17)
    expect(labels[0]).toBe('jul') // la primera semana incluye el 1 de julio
    expect(labels[4]).toBe('ago')
    expect(labels[9]).toBe('sep')
    expect(labels[13]).toBe('oct')
    expect(labels.filter(Boolean)).toHaveLength(4)
  })
})

// --- Barras y ranking (T5) --------------------------------------------------

describe('getBars', () => {
  it('semana: una barra por día de lunes a domingo', () => {
    const completions = { daily: ['2026-10-19', '2026-10-20', '2026-10-21'] }
    const bars = getBars('week', [dailyHabit()], completions, TODAY)
    expect(bars.map((bar) => bar.label)).toEqual(['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'])
    expect(bars[0]).toMatchObject({ rate: 100, done: 1, total: 1 })
    expect(bars[2]).toMatchObject({ rate: 100 }) // hoy, ya hecho
  })

  it('semana: los días futuros y sin oportunidades no tienen tasa (no son 0 %)', () => {
    const bars = getBars('week', [mwfHabit()], {}, TODAY)
    expect(bars[1].rate).toBeNull() // martes: no le toca
    expect(bars[3].rate).toBeNull() // jueves: futuro
    expect(bars[0].rate).toBe(0) // lunes: le tocaba y no lo hizo
  })

  it('mes: una barra por semana recortada al rango, etiquetada con la fecha de su lunes', () => {
    const completions = { daily: ['2026-10-01', '2026-10-02'] }
    const bars = getBars('month', [dailyHabit()], completions, TODAY)
    expect(bars.map((bar) => bar.label)).toEqual(['28 sep', '5 oct', '12 oct', '19 oct'])
    expect(bars[0]).toMatchObject({ done: 2, total: 4, rate: 50 }) // solo 1–4 de octubre
    expect(bars[1]).toMatchObject({ done: 0, total: 7, rate: 0 })
    expect(bars[3]).toMatchObject({ total: 2 }) // 19 y 20; hoy pendiente no cuenta
  })

  it('90 días: barras semanales que cubren todo el rango', () => {
    const bars = getBars('90days', [dailyHabit()], {}, TODAY)
    expect(bars).toHaveLength(14)
    expect(bars[0].label).toBe('20 jul')
  })

  it('una semana sin oportunidades tiene tasa null', () => {
    const bars = getBars('month', [dailyHabit({ createdAt: '2026-10-20' })], {}, TODAY)
    expect(bars[0].rate).toBeNull()
  })
})

describe('getHabitRanking', () => {
  const range = { start: day('2026-10-19'), end: day('2026-10-21') }
  const habits = [
    dailyHabit({ id: 'g', name: 'Gama' }),
    dailyHabit({ id: 'b', name: 'Beta' }),
    dailyHabit({ id: 'a', name: 'Alfa' }),
    dailyHabit({ id: 'z', name: 'Zeta', createdAt: '2026-10-30' }), // todavía no empezó
  ]
  const completions = {
    a: ['2026-10-19', '2026-10-20'],
    b: ['2026-10-19', '2026-10-20'],
    g: ['2026-10-19'],
  }

  it('ordena por tasa descendente y desempata por nombre', () => {
    const ranking = getHabitRanking(habits, completions, range, TODAY)
    expect(ranking.map((item) => item.name)).toEqual(['Alfa', 'Beta', 'Gama'])
    expect(ranking[0]).toMatchObject({ id: 'a', done: 2, total: 2, rate: 100 })
    expect(ranking[2]).toMatchObject({ id: 'g', done: 1, total: 2, rate: 50 })
  })

  it('excluye los hábitos sin oportunidades en el período', () => {
    const ranking = getHabitRanking(habits, completions, range, TODAY)
    expect(ranking.find((item) => item.id === 'z')).toBeUndefined()
  })
})
