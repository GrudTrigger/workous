import type { Exercise, Stats, Workout, WorkoutInput } from './types'

// По умолчанию — относительный путь: в dev его проксирует Vite, в Docker — nginx
const BASE_URL = import.meta.env.VITE_API_URL ?? ''

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
  if (!response.ok) {
    let message = `Ошибка ${response.status}`
    try {
      const body = await response.json()
      if (typeof body.detail === 'string') message = body.detail
    } catch {
      // тело не JSON — оставляем стандартное сообщение
    }
    throw new ApiError(response.status, message)
  }
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export const api = {
  listExercises: () => request<Exercise[]>('/api/exercises'),
  createExercise: (name: string, muscle_group: string) =>
    request<Exercise>('/api/exercises', {
      method: 'POST',
      body: JSON.stringify({ name, muscle_group }),
    }),
  deleteExercise: (id: number) => request<void>(`/api/exercises/${id}`, { method: 'DELETE' }),

  listWorkouts: () => request<Workout[]>('/api/workouts'),
  createWorkout: (data: WorkoutInput) =>
    request<Workout>('/api/workouts', { method: 'POST', body: JSON.stringify(data) }),
  deleteWorkout: (id: number) => request<void>(`/api/workouts/${id}`, { method: 'DELETE' }),

  getStats: () => request<Stats>('/api/stats'),
}
