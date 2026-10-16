import { useState, type FormEvent } from 'react'

import type { Exercise, WorkoutInput } from '../types'
import { calcVolume, formatWeight, todayIso } from '../utils'

interface Row {
  exercise_id: string
  reps: string
  weight: string
}

interface Props {
  exercises: Exercise[]
  onSubmit: (data: WorkoutInput) => Promise<boolean>
}

const emptyRow = (exercise_id = ''): Row => ({ exercise_id, reps: '', weight: '' })

export default function WorkoutForm({ exercises, onSubmit }: Props) {
  const [date, setDate] = useState(todayIso())
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [rows, setRows] = useState<Row[]>([emptyRow()])
  const [submitting, setSubmitting] = useState(false)

  const validSets = rows
    .filter((r) => r.exercise_id && Number(r.reps) > 0)
    .map((r) => ({
      exercise_id: Number(r.exercise_id),
      reps: Number(r.reps),
      weight: Number(r.weight) || 0,
    }))

  const updateRow = (index: number, patch: Partial<Row>) =>
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)))

  // Новый подход по умолчанию — то же упражнение, что и в последней строке
  const addRow = () => setRows((prev) => [...prev, emptyRow(prev.at(-1)?.exercise_id)])

  const removeRow = (index: number) =>
    setRows((prev) => (prev.length === 1 ? [emptyRow()] : prev.filter((_, i) => i !== index)))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    const ok = await onSubmit({ date, title: title.trim(), notes, sets: validSets })
    setSubmitting(false)
    if (ok) {
      setTitle('')
      setNotes('')
      setRows([emptyRow()])
    }
  }

  if (exercises.length === 0) {
    return (
      <section className="card">
        <h2>Новая тренировка</h2>
        <p className="muted">Сначала добавьте упражнения на вкладке «Упражнения».</p>
      </section>
    )
  }

  return (
    <section className="card">
      <h2>Новая тренировка</h2>
      <form onSubmit={handleSubmit} className="workout-form">
        <div className="form-row">
          <label>
            Дата
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </label>
          <label className="grow">
            Название
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Например: Грудь + трицепс"
              required
            />
          </label>
        </div>

        <table className="sets-table">
          <thead>
            <tr>
              <th>Упражнение</th>
              <th>Повторы</th>
              <th>Вес, кг</th>
              <th aria-label="Действия" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                <td>
                  <select
                    aria-label={`Упражнение ${i + 1}`}
                    value={row.exercise_id}
                    onChange={(e) => updateRow(i, { exercise_id: e.target.value })}
                  >
                    <option value="">— выберите —</option>
                    {exercises.map((ex) => (
                      <option key={ex.id} value={ex.id}>
                        {ex.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <input
                    aria-label={`Повторы ${i + 1}`}
                    type="number"
                    min={1}
                    value={row.reps}
                    onChange={(e) => updateRow(i, { reps: e.target.value })}
                  />
                </td>
                <td>
                  <input
                    aria-label={`Вес ${i + 1}`}
                    type="number"
                    min={0}
                    step={0.5}
                    value={row.weight}
                    onChange={(e) => updateRow(i, { weight: e.target.value })}
                  />
                </td>
                <td>
                  <button
                    type="button"
                    className="link danger"
                    onClick={() => removeRow(i)}
                    aria-label={`Удалить подход ${i + 1}`}
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button type="button" className="secondary" onClick={addRow}>
          + Подход
        </button>

        <label>
          Заметки
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
        </label>

        <div className="form-footer">
          <span className="muted">
            Подходов: {validSets.length} · Тоннаж: {formatWeight(calcVolume(validSets))}
          </span>
          <button type="submit" disabled={submitting || !title.trim() || validSets.length === 0}>
            Сохранить
          </button>
        </div>
      </form>
    </section>
  )
}
