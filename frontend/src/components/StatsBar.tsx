import type { Stats } from '../types'
import { formatWeight } from '../utils'

export default function StatsBar({ stats }: { stats: Stats }) {
  const top = [...stats.records].sort((a, b) => b.max_weight - a.max_weight).slice(0, 3)

  return (
    <section className="stats" aria-label="Статистика">
      <div className="stat">
        <span className="stat-value">{stats.total_workouts}</span>
        <span className="stat-label">тренировок</span>
      </div>
      <div className="stat">
        <span className="stat-value">{stats.workouts_last_7_days}</span>
        <span className="stat-label">за 7 дней</span>
      </div>
      <div className="stat">
        <span className="stat-value">{stats.total_sets}</span>
        <span className="stat-label">подходов</span>
      </div>
      <div className="stat">
        <span className="stat-value">{formatWeight(stats.total_volume)}</span>
        <span className="stat-label">общий тоннаж</span>
      </div>
      {top.length > 0 && (
        <div className="stat records">
          <span className="stat-label">Рекорды</span>
          <ul>
            {top.map((r) => (
              <li key={r.exercise_id}>
                {r.exercise_name}: <strong>{formatWeight(r.max_weight)}</strong>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
