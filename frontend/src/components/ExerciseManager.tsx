import { useState, type FormEvent } from 'react'

import type { Exercise } from '../types'

interface Props {
  exercises: Exercise[]
  onCreate: (name: string, muscleGroup: string) => Promise<boolean>
  onDelete: (id: number) => void
}

const MUSCLE_GROUPS = ['Грудь', 'Спина', 'Ноги', 'Плечи', 'Руки', 'Пресс', 'Кардио']

export default function ExerciseManager({ exercises, onCreate, onDelete }: Props) {
  const [name, setName] = useState('')
  const [group, setGroup] = useState(MUSCLE_GROUPS[0])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (await onCreate(name.trim(), group)) setName('')
  }

  return (
    <section className="card">
      <h2>Упражнения</h2>
      <form onSubmit={handleSubmit} className="form-row">
        <label className="grow">
          Название
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Например: Становая тяга"
            required
          />
        </label>
        <label>
          Группа мышц
          <select value={group} onChange={(e) => setGroup(e.target.value)}>
            {MUSCLE_GROUPS.map((g) => (
              <option key={g}>{g}</option>
            ))}
          </select>
        </label>
        <button type="submit" disabled={!name.trim()}>
          Добавить
        </button>
      </form>

      {exercises.length === 0 ? (
        <p className="muted">Список пуст — добавьте первое упражнение.</p>
      ) : (
        <ul className="exercise-list">
          {exercises.map((ex) => (
            <li key={ex.id}>
              <span>
                {ex.name}
                {ex.muscle_group && <span className="badge">{ex.muscle_group}</span>}
              </span>
              <button
                className="link danger"
                onClick={() => onDelete(ex.id)}
                aria-label={`Удалить ${ex.name}`}
              >
                Удалить
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
