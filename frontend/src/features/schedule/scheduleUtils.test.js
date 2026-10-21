import { describe, expect, it } from 'vitest'
import {
  blocksOverlap,
  buildTimeOptions,
  findOverlap,
  formatDuration,
  getAssignableHabits,
  getAssignedHabits,
  countBlocksWithHabit,
  getBlocksOutsideRange,
  getMinutesByCategory,
  getResizeBounds,
  migrateScheduleFromV1,
  removeHabitFromBlocks,
  resizeBlock,
  snapToSlot,
  toTimeLabel,
  validateBlock,
  validateCategoryName,
  validateRange,
} from './scheduleUtils.js'

const SETTINGS = { dayStart: 7 * 60, dayEnd: 22 * 60 } // 07:00–22:00

// Helper: crea un bloque con horas en formato decimal (9.5 → 09:30)
const block = (id, day, startHour, endHour, extra = {}) => ({
  id,
  title: id,
  day,
  start: startHour * 60,
  end: endHour * 60,
  categoryId: 'c1',
  ...extra,
})

describe('conversión de horas', () => {
  it('toTimeLabel formatea minutos como HH:MM', () => {
    expect(toTimeLabel(570)).toBe('09:30')
    expect(toTimeLabel(0)).toBe('00:00')
    expect(toTimeLabel(1440)).toBe('24:00')
  })

  it('buildTimeOptions genera opciones cada 15 minutos, inclusive', () => {
    expect(buildTimeOptions(540, 600)).toEqual([540, 555, 570, 585, 600])
  })

  it('snapToSlot redondea al cuarto de hora más cercano', () => {
    expect(snapToSlot(547)).toBe(540) // 09:07 → 09:00
    expect(snapToSlot(548)).toBe(555) // 09:08 → 09:15
  })

  it('formatDuration muestra horas y minutos', () => {
    expect(formatDuration(45)).toBe('45 min')
    expect(formatDuration(120)).toBe('2 h')
    expect(formatDuration(150)).toBe('2 h 30 min')
  })
})

describe('solapamiento', () => {
  it('detecta bloques que se pisan el mismo día', () => {
    expect(blocksOverlap(block('a', 1, 9, 11), block('b', 1, 10, 12))).toBe(true)
  })

  it('bloques contiguos NO se solapan', () => {
    expect(blocksOverlap(block('a', 1, 10, 11), block('b', 1, 11, 12))).toBe(false)
  })

  it('el mismo horario en días distintos no se solapa', () => {
    expect(blocksOverlap(block('a', 1, 9, 11), block('b', 2, 9, 11))).toBe(false)
  })

  it('un bloque contenido dentro de otro se solapa', () => {
    expect(blocksOverlap(block('a', 1, 9, 12), block('b', 1, 10, 11))).toBe(true)
  })

  it('al editar, el bloque no choca consigo mismo', () => {
    const blocks = [block('a', 1, 9, 11)]
    expect(findOverlap({ ...blocks[0], end: 11.5 * 60 }, blocks)).toBeUndefined()
  })
})

describe('validateBlock', () => {
  const blocks = [block('gym', 2, 18, 19, { title: 'Gym' })]

  it('acepta un bloque válido', () => {
    expect(validateBlock(block('new', 2, 19, 20), blocks, SETTINGS)).toBeNull()
  })

  it('exige título y categoría', () => {
    expect(validateBlock(block('new', 2, 9, 10, { title: '  ' }), blocks, SETTINGS)).toBe('El título es obligatorio.')
    expect(validateBlock(block('new', 2, 9, 10, { categoryId: '' }), blocks, SETTINGS)).toBe('Elige una categoría.')
  })

  it('el fin debe ser posterior al inicio', () => {
    expect(validateBlock(block('new', 2, 10, 10), blocks, SETTINGS)).toMatch(/posterior/)
  })

  it('rechaza bloques fuera de la franja', () => {
    expect(validateBlock(block('new', 2, 6, 8), blocks, SETTINGS)).toBe('El bloque debe estar entre 07:00 y 22:00.')
  })

  it('el mensaje de solapamiento dice con qué bloque choca', () => {
    expect(validateBlock(block('new', 2, 18.5, 19.5), blocks, SETTINGS)).toBe(
      'Se superpone con «Gym» (18:00–19:00).',
    )
  })
})

describe('redimensionado', () => {
  // Lunes: a (08–09), b (10–11), c (13–14)
  const blocks = [block('a', 1, 8, 9), block('b', 1, 10, 11), block('c', 1, 13, 14), block('x', 2, 11, 13)]
  const b = blocks[1]

  it('el borde de arriba no pasa el fin del vecino anterior', () => {
    expect(getResizeBounds(b, 'start', blocks, SETTINGS)).toEqual({ min: 9 * 60, max: 10 * 60 + 45 })
  })

  it('el borde de abajo no pasa el inicio del vecino siguiente', () => {
    expect(getResizeBounds(b, 'end', blocks, SETTINGS)).toEqual({ min: 10 * 60 + 15, max: 13 * 60 })
  })

  it('bloques de otros días no limitan', () => {
    // "x" es del martes de 11 a 13: no debe frenar al lunes
    expect(resizeBlock(b, 'end', 12.5 * 60, blocks, SETTINGS)).toEqual({ start: 600, end: 750 })
  })

  it('sin vecinos, el límite es la franja', () => {
    expect(resizeBlock(blocks[0], 'start', 5 * 60, blocks, SETTINGS)).toEqual({ start: 420, end: 540 })
    expect(resizeBlock(blocks[2], 'end', 23 * 60, blocks, SETTINGS)).toEqual({ start: 780, end: 1320 })
  })

  it('respeta la duración mínima de 15 minutos', () => {
    expect(resizeBlock(b, 'start', 11 * 60 + 30, blocks, SETTINGS)).toEqual({ start: 645, end: 660 })
    expect(resizeBlock(b, 'end', 9 * 60, blocks, SETTINGS)).toEqual({ start: 600, end: 615 })
  })

  it('ajusta a saltos de 15 minutos', () => {
    expect(resizeBlock(b, 'end', 11 * 60 + 37, blocks, SETTINGS)).toEqual({ start: 600, end: 690 })
  })
})

describe('franja horaria', () => {
  const blocks = [block('Gym', 6, 6, 7), block('Lectura', 4, 20, 21)]

  it('lista los bloques que quedarían fuera', () => {
    expect(getBlocksOutsideRange(blocks, 7 * 60, 22 * 60).map((b) => b.id)).toEqual(['Gym'])
  })

  it('rechaza una franja que deja bloques afuera, con detalle', () => {
    expect(validateRange(7 * 60, 22 * 60, blocks)).toBe('Quedarían fuera: «Gym» (Sáb 06:00–07:00).')
  })

  it('rechaza franjas invertidas o de menos de 1 hora', () => {
    expect(validateRange(22 * 60, 8 * 60, [])).toMatch(/posterior/)
    expect(validateRange(600, 630, [])).toBe('La franja debe durar al menos 1 hora.')
  })

  it('acepta una franja válida', () => {
    expect(validateRange(6 * 60, 23 * 60, blocks)).toBeNull()
  })
})

describe('categorías', () => {
  const categories = [
    { id: 'c1', name: 'Salud', color: 'emerald' },
    { id: 'c2', name: 'Estudio', color: 'sky' },
  ]

  it('el nombre es obligatorio y no se repite (sin importar mayúsculas)', () => {
    expect(validateCategoryName('  ', categories)).toBe('El nombre es obligatorio.')
    expect(validateCategoryName(' salud ', categories)).toBe('Ya existe una categoría con ese nombre.')
    expect(validateCategoryName('Ocio', categories)).toBeNull()
  })

  it('al renombrar, puede conservar su propio nombre', () => {
    expect(validateCategoryName('Salud', categories, 'c1')).toBeNull()
  })

  it('suma minutos por categoría y en total', () => {
    const blocks = [
      block('a', 1, 9, 11, { categoryId: 'c1' }),
      block('b', 2, 9, 9.5, { categoryId: 'c1' }),
      block('c', 3, 18, 19, { categoryId: 'c2' }),
    ]
    const { total, byCategory } = getMinutesByCategory(blocks, categories)
    expect(total).toBe(210)
    expect(byCategory.map((item) => item.minutes)).toEqual([150, 60])
  })
})

// Hábitos de ejemplo, en el orden en que existen en la sección Hábitos
const HABITS = [
  { id: 'h1', name: 'Meditar' },
  { id: 'h2', name: 'Leer' },
  { id: 'h3', name: 'Gym' },
]

describe('getAssignedHabits', () => {
  it('devuelve los hábitos en el orden en que se asignaron', () => {
    expect(getAssignedHabits(['h3', 'h1'], HABITS).map((habit) => habit.name)).toEqual(['Gym', 'Meditar'])
  })

  it('ignora los ids de hábitos que ya no existen', () => {
    expect(getAssignedHabits(['borrado', 'h2'], HABITS).map((habit) => habit.id)).toEqual(['h2'])
  })

  it('sin hábitos asignados devuelve una lista vacía', () => {
    expect(getAssignedHabits([], HABITS)).toEqual([])
  })
})

describe('getAssignableHabits', () => {
  it('devuelve los no asignados, en el orden de la lista de hábitos', () => {
    expect(getAssignableHabits(['h2'], HABITS).map((habit) => habit.id)).toEqual(['h1', 'h3'])
  })

  it('sin hábitos asignados se pueden agregar todos', () => {
    expect(getAssignableHabits([], HABITS)).toEqual(HABITS)
  })

  it('con todos asignados no queda ninguno para agregar', () => {
    expect(getAssignableHabits(['h1', 'h2', 'h3'], HABITS)).toEqual([])
  })

  it('sin hábitos creados no hay nada para agregar', () => {
    expect(getAssignableHabits([], [])).toEqual([])
  })
})

describe('countBlocksWithHabit', () => {
  const blocks = [
    block('a', 1, 9, 10, { habitIds: ['h1', 'h2'] }),
    block('b', 2, 9, 10, { habitIds: ['h1'] }),
    block('c', 3, 9, 10, { habitIds: [] }),
  ]

  it('cuenta 0 si el hábito no está en ningún bloque', () => {
    expect(countBlocksWithHabit(blocks, 'h3')).toBe(0)
  })

  it('cuenta 1 si el hábito está en un solo bloque', () => {
    expect(countBlocksWithHabit(blocks, 'h2')).toBe(1)
  })

  it('cuenta todos los bloques que tienen el hábito', () => {
    expect(countBlocksWithHabit(blocks, 'h1')).toBe(2)
  })
})

describe('removeHabitFromBlocks', () => {
  it('quita el hábito de todos los bloques y deja los demás hábitos', () => {
    const blocks = [
      block('a', 1, 9, 10, { habitIds: ['h1', 'h2'] }),
      block('b', 2, 9, 10, { habitIds: ['h1'] }),
    ]
    const result = removeHabitFromBlocks(blocks, 'h1')
    expect(result.map((item) => item.habitIds)).toEqual([['h2'], []])
  })

  it('no cambia los demás campos ni los bloques que no lo tienen', () => {
    const untouched = block('b', 2, 9, 10, { habitIds: ['h2'] })
    const result = removeHabitFromBlocks([block('a', 1, 9, 10, { habitIds: ['h1'] }), untouched], 'h1')
    expect(result[0]).toEqual(block('a', 1, 9, 10, { habitIds: [] }))
    expect(result[1]).toBe(untouched)
  })
})

describe('migrateScheduleFromV1', () => {
  it('agrega habitIds vacío a cada bloque sin perder categorías ni ajustes', () => {
    const v1 = {
      blocks: [block('a', 1, 9, 10)],
      categories: [{ id: 'c1', name: 'Salud', color: 'emerald' }],
      settings: SETTINGS,
    }
    expect(migrateScheduleFromV1(v1)).toEqual({
      blocks: [block('a', 1, 9, 10, { habitIds: [] })],
      categories: v1.categories,
      settings: SETTINGS,
    })
  })
})
