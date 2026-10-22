import { describe, expect, it } from 'vitest'
import {
  getBestStreak,
  getConsistency,
  getCurrentStreak,
  getGlobalStreak,
  getTodayProgress,
  isScheduledOn,
  moveItem,
} from './habitStats.js'
import { fromDateKey } from '../../lib/dates.js'

// "Hoy" fijo para que los tests no dependan del día en que se ejecutan.
// 2026-10-21 es miércoles.
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

describe('isScheduledOn', () => {
  it('un hábito diario toca todos los días', () => {
    expect(isScheduledOn(dailyHabit(), fromDateKey('2026-10-18'))).toBe(true)
  })

  it('un hábito semanal solo toca en sus días', () => {
    expect(isScheduledOn(mwfHabit(), fromDateKey('2026-10-19'))).toBe(true) // lunes
    expect(isScheduledOn(mwfHabit(), fromDateKey('2026-10-20'))).toBe(false) // martes
  })
})

describe('moveItem', () => {
  it('mueve un elemento hacia el principio sin alterar el orden de los demás', () => {
    expect(moveItem(['A', 'B', 'C'], 2, 0)).toEqual(['C', 'A', 'B'])
  })

  it('mueve un elemento hacia el final sin alterar el orden de los demás', () => {
    expect(moveItem(['A', 'B', 'C'], 0, 2)).toEqual(['B', 'C', 'A'])
  })

  it('mueve un elemento una posición', () => {
    expect(moveItem(['A', 'B', 'C'], 1, 0)).toEqual(['B', 'A', 'C'])
  })

  it('devuelve la misma lista si origen y destino coinciden', () => {
    const list = ['A', 'B', 'C']
    expect(moveItem(list, 1, 1)).toBe(list)
  })

  it('devuelve la misma lista si algún índice está fuera de rango', () => {
    const list = ['A', 'B', 'C']
    expect(moveItem(list, -1, 1)).toBe(list)
    expect(moveItem(list, 0, 3)).toBe(list)
    expect(moveItem(list, 5, 0)).toBe(list)
  })

  it('no modifica la lista original', () => {
    const list = ['A', 'B', 'C']
    moveItem(list, 2, 0)
    expect(list).toEqual(['A', 'B', 'C'])
  })

  it('con un solo elemento no cambia nada', () => {
    const list = ['A']
    expect(moveItem(list, 0, 0)).toBe(list)
  })
})

describe('getCurrentStreak', () => {
  it('cuenta días consecutivos hasta hoy inclusive', () => {
    const completions = { daily: ['2026-10-19', '2026-10-20', '2026-10-21'] }
    expect(getCurrentStreak(dailyHabit(), completions, TODAY)).toBe(3)
  })

  it('si hoy está pendiente, la racha no se corta y cuenta desde ayer', () => {
    const completions = { daily: ['2026-10-19', '2026-10-20'] }
    expect(getCurrentStreak(dailyHabit(), completions, TODAY)).toBe(2)
  })

  it('un día salteado corta la racha', () => {
    const completions = { daily: ['2026-10-18', '2026-10-20', '2026-10-21'] }
    expect(getCurrentStreak(dailyHabit(), completions, TODAY)).toBe(2)
  })

  it('en frecuencia semanal, los días que no tocan no cortan la racha', () => {
    // vie 16, lun 19, mié 21 → 3 seguidos (sáb, dom y mar no tocan)
    const completions = { mwf: ['2026-10-16', '2026-10-19', '2026-10-21'] }
    expect(getCurrentStreak(mwfHabit(), completions, TODAY)).toBe(3)
  })

  it('un hábito creado hace poco no se penaliza por días anteriores', () => {
    const habit = dailyHabit({ createdAt: '2026-10-20' })
    const completions = { daily: ['2026-10-20', '2026-10-21'] }
    expect(getCurrentStreak(habit, completions, TODAY)).toBe(2)
  })

  it('cuenta días marcados de forma retroactiva, antes de crear el hábito', () => {
    const habit = dailyHabit({ createdAt: '2026-10-21' })
    const completions = { daily: ['2026-10-19', '2026-10-20', '2026-10-21'] }
    expect(getCurrentStreak(habit, completions, TODAY)).toBe(3)
  })

  it('sin registros la racha es 0', () => {
    expect(getCurrentStreak(dailyHabit(), {}, TODAY)).toBe(0)
  })
})

describe('getBestStreak', () => {
  it('devuelve la secuencia más larga del historial', () => {
    const completions = {
      daily: ['2026-10-02', '2026-10-03', '2026-10-04', '2026-10-05', '2026-10-20', '2026-10-21'],
    }
    expect(getBestStreak(dailyHabit(), completions, TODAY)).toBe(4)
  })
})

describe('getTodayProgress', () => {
  it('solo cuenta los hábitos que tocan hoy', () => {
    const habits = [dailyHabit(), mwfHabit({ frequency: { type: 'weekdays', days: [2] } })]
    const completions = { daily: ['2026-10-21'] }
    expect(getTodayProgress(habits, completions, TODAY)).toEqual({ done: 1, total: 1 })
  })
})

describe('getGlobalStreak', () => {
  it('cuenta días en que se cumplieron TODOS los hábitos programados', () => {
    const habits = [dailyHabit(), mwfHabit()]
    const completions = {
      daily: ['2026-10-19', '2026-10-20', '2026-10-21'],
      mwf: ['2026-10-19'], // falta el miércoles 21 (hoy) → hoy no corta, cuenta desde ayer
    }
    expect(getGlobalStreak(habits, completions, TODAY)).toBe(2)
  })

  it('sin hábitos es 0', () => {
    expect(getGlobalStreak([], {}, TODAY)).toBe(0)
  })
})

describe('getConsistency', () => {
  it('calcula hechos / programados, sin penalizar hoy si está pendiente', () => {
    const habit = dailyHabit({ createdAt: '2026-10-18' })
    // Días programados: 18, 19, 20 (hoy 21 pendiente no cuenta) → 2 de 3 = 67%
    const completions = { daily: ['2026-10-18', '2026-10-20'] }
    expect(getConsistency([habit], completions, TODAY)).toBe(67)
  })

  it('un registro retroactivo adelanta el inicio: los días sin marcar desde ahí cuentan', () => {
    const habit = dailyHabit({ createdAt: '2026-10-21' })
    // Empieza el 18 por el registro retroactivo → 18, 19, 20 programados; hecho solo el 18 → 33%
    const completions = { daily: ['2026-10-18'] }
    expect(getConsistency([habit], completions, TODAY)).toBe(33)
  })

  it('devuelve null si no hubo nada programado', () => {
    expect(getConsistency([], {}, TODAY)).toBeNull()
  })
})
