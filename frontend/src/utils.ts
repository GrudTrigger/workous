import type { SetInput, WorkoutSet } from './types'

export function calcVolume(sets: Pick<SetInput, 'reps' | 'weight'>[]): number {
  return sets.reduce((sum, s) => sum + s.reps * s.weight, 0)
}

export function formatWeight(kg: number): string {
  if (kg >= 10000) return `${(kg / 1000).toFixed(1).replace('.', ',')} т`
  return `${Number.isInteger(kg) ? kg : kg.toFixed(1).replace('.', ',')} кг`
}

export function formatDate(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    weekday: 'short',
  })
}

export function todayIso(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** Группирует подходы по упражнению, сохраняя порядок первого появления. */
export function groupSets(sets: WorkoutSet[]): { name: string; sets: WorkoutSet[] }[] {
  const groups = new Map<number, { name: string; sets: WorkoutSet[] }>()
  for (const s of sets) {
    const group = groups.get(s.exercise_id) ?? { name: s.exercise_name, sets: [] }
    group.sets.push(s)
    groups.set(s.exercise_id, group)
  }
  return [...groups.values()]
}
