import type { Workout } from '../types'
import { formatDate, formatWeight, groupSets } from '../utils'

interface Props {
  workouts: Workout[]
  onDelete: (id: number) => void
}

export default function WorkoutList({ workouts, onDelete }: Props) {
  if (workouts.length === 0) {
    return <p className="muted">Пока нет ни одной тренировки. Самое время начать!</p>
  }

  return (
    <section aria-label="История тренировок" className="workout-list">
      {workouts.map((w) => (
        <article key={w.id} className="card workout">
          <header className="workout-header">
            <div>
              <h3>{w.title}</h3>
              <span className="muted">{formatDate(w.date)}</span>
            </div>
            <div className="workout-meta">
              <span className="badge">{formatWeight(w.total_volume)}</span>
              <button
                className="link danger"
                onClick={() => {
                  if (confirm(`Удалить тренировку «${w.title}»?`)) onDelete(w.id)
                }}
                aria-label={`Удалить тренировку ${w.title}`}
              >
                Удалить
              </button>
            </div>
          </header>
          <ul className="exercise-groups">
            {groupSets(w.sets).map((g) => (
              <li key={g.name}>
                <strong>{g.name}</strong>
                <span className="set-chips">
                  {g.sets.map((s) => (
                    <span key={s.id} className="chip">
                      {s.weight > 0 ? `${s.weight} × ${s.reps}` : `${s.reps} повт.`}
                    </span>
                  ))}
                </span>
              </li>
            ))}
          </ul>
          {w.notes && <p className="notes">{w.notes}</p>}
        </article>
      ))}
    </section>
  )
}
