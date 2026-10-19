import { describe, expect, it } from 'vitest'
import { addDays, fromDateKey, getIsoWeekNumber, startOfWeek, toDateKey } from './dates.js'

describe('dates', () => {
  it('toDateKey usa la hora local, no UTC', () => {
    // 23:30 local: con toISOString() podría salir el día siguiente.
    expect(toDateKey(new Date(2026, 9, 19, 23, 30))).toBe('2026-10-19')
  })

  it('fromDateKey y toDateKey son inversas', () => {
    expect(toDateKey(fromDateKey('2026-02-28'))).toBe('2026-02-28')
  })

  it('addDays cruza fin de mes', () => {
    expect(toDateKey(addDays(fromDateKey('2026-10-31'), 1))).toBe('2026-11-01')
  })

  it('startOfWeek devuelve el lunes, también desde un domingo', () => {
    expect(toDateKey(startOfWeek(fromDateKey('2026-10-21')))).toBe('2026-10-19') // miércoles
    expect(toDateKey(startOfWeek(fromDateKey('2026-10-25')))).toBe('2026-10-19') // domingo
  })

  it('getIsoWeekNumber sigue la norma ISO-8601', () => {
    expect(getIsoWeekNumber(fromDateKey('2026-10-19'))).toBe(43)
    expect(getIsoWeekNumber(fromDateKey('2026-01-01'))).toBe(1)
    expect(getIsoWeekNumber(fromDateKey('2027-01-01'))).toBe(53) // viernes → semana 53 de 2026
  })
})
