import { useCallback, useEffect, useState } from 'react'

import { api } from './api'
import ExerciseManager from './components/ExerciseManager'
import StatsBar from './components/StatsBar'
import WorkoutForm from './components/WorkoutForm'
import WorkoutList from './components/WorkoutList'
import type { Exercise, Stats, Workout, WorkoutInput } from './types'

type Tab = 'workouts' | 'exercises'

export default function App() {
  const [tab, setTab] = useState<Tab>('workouts')
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    try {
      const [ex, wo, st] = await Promise.all([
        api.listExercises(),
        api.listWorkouts(),
        api.getStats(),
      ])
      setExercises(ex)
      setWorkouts(wo)
      setStats(st)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось загрузить данные')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- первичная загрузка данных
    void reload()
  }, [reload])

  // Оборачивает действие: показывает ошибку и перезагружает данные после успеха
  const run = async (action: () => Promise<unknown>) => {
    try {
      await action()
      await reload()
      return true
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Что-то пошло не так')
      return false
    }
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Дневник тренировок</h1>
        <nav className="tabs" aria-label="Разделы">
          <button
            className={tab === 'workouts' ? 'tab active' : 'tab'}
            onClick={() => setTab('workouts')}
          >
            Тренировки
          </button>
          <button
            className={tab === 'exercises' ? 'tab active' : 'tab'}
            onClick={() => setTab('exercises')}
          >
            Упражнения
          </button>
        </nav>
      </header>

      {error && (
        <div className="error" role="alert">
          {error}
          <button className="link" onClick={() => setError(null)} aria-label="Закрыть ошибку">
            ×
          </button>
        </div>
      )}

      {loading ? (
        <p className="muted">Загрузка…</p>
      ) : tab === 'workouts' ? (
        <>
          {stats && <StatsBar stats={stats} />}
          <WorkoutForm
            exercises={exercises}
            onSubmit={(data: WorkoutInput) => run(() => api.createWorkout(data))}
          />
          <WorkoutList workouts={workouts} onDelete={(id) => run(() => api.deleteWorkout(id))} />
        </>
      ) : (
        <ExerciseManager
          exercises={exercises}
          onCreate={(name, group) => run(() => api.createExercise(name, group))}
          onDelete={(id) => run(() => api.deleteExercise(id))}
        />
      )}
    </div>
  )
}
