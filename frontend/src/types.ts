export interface Exercise {
  id: number
  name: string
  muscle_group: string
}

export interface WorkoutSet {
  id: number
  exercise_id: number
  exercise_name: string
  reps: number
  weight: number
}

export interface Workout {
  id: number
  date: string
  title: string
  notes: string
  sets: WorkoutSet[]
  total_volume: number
}

export interface SetInput {
  exercise_id: number
  reps: number
  weight: number
}

export interface WorkoutInput {
  date: string
  title: string
  notes: string
  sets: SetInput[]
}

export interface ExerciseRecord {
  exercise_id: number
  exercise_name: string
  max_weight: number
  total_sets: number
}

export interface Stats {
  total_workouts: number
  total_sets: number
  total_volume: number
  workouts_last_7_days: number
  records: ExerciseRecord[]
}
