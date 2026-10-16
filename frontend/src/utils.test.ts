import { describe, expect, it } from 'vitest'

import type { WorkoutSet } from './types'
import { calcVolume, formatWeight, groupSets } from './utils'

describe('calcVolume', () => {
  it('суммирует повторы × вес', () => {
    expect(
      calcVolume([
        { reps: 10, weight: 50 },
        { reps: 5, weight: 100 },
      ]),
    ).toBe(1000)
  })

  it('возвращает 0 для пустого списка', () => {
    expect(calcVolume([])).toBe(0)
  })
})

describe('formatWeight', () => {
  it('форматирует килограммы', () => {
    expect(formatWeight(80)).toBe('80 кг')
    expect(formatWeight(52.5)).toBe('52,5 кг')
  })

  it('переводит в тонны от 10 000 кг', () => {
    expect(formatWeight(1025)).toBe('1025 кг')
    expect(formatWeight(12500)).toBe('12,5 т')
  })
})

describe('groupSets', () => {
  it('группирует подходы по упражнению в порядке появления', () => {
    const sets: WorkoutSet[] = [
      { id: 1, exercise_id: 2, exercise_name: 'Присед', reps: 5, weight: 100 },
      { id: 2, exercise_id: 1, exercise_name: 'Жим', reps: 5, weight: 80 },
      { id: 3, exercise_id: 2, exercise_name: 'Присед', reps: 5, weight: 110 },
    ]
    const groups = groupSets(sets)
    expect(groups.map((g) => g.name)).toEqual(['Присед', 'Жим'])
    expect(groups[0].sets).toHaveLength(2)
  })
})
