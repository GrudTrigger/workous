import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import App from './App'

const responses: Record<string, unknown> = {
  '/api/exercises': [{ id: 1, name: 'Жим лёжа', muscle_group: 'Грудь' }],
  '/api/workouts': [
    {
      id: 1,
      date: '2026-10-10',
      title: 'Грудной день',
      notes: '',
      total_volume: 400,
      sets: [{ id: 1, exercise_id: 1, exercise_name: 'Жим лёжа', reps: 5, weight: 80 }],
    },
  ],
  '/api/stats': {
    total_workouts: 1,
    total_sets: 1,
    total_volume: 400,
    workouts_last_7_days: 1,
    records: [{ exercise_id: 1, exercise_name: 'Жим лёжа', max_weight: 80, total_sets: 1 }],
  },
}

function mockFetch() {
  return vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
    const url = String(input)
    return new Response(JSON.stringify(responses[url]), { status: 200 })
  })
}

describe('App', () => {
  it('загружает и показывает тренировки', async () => {
    mockFetch()
    render(<App />)

    expect(await screen.findByText('Грудной день')).toBeInTheDocument()
    expect(screen.getByText('80 × 5')).toBeInTheDocument()
    expect(screen.getByLabelText('Статистика')).toHaveTextContent('400 кг')
  })

  it('переключается на вкладку упражнений', async () => {
    mockFetch()
    const user = userEvent.setup()
    render(<App />)

    await screen.findByText('Грудной день')
    await user.click(screen.getByRole('button', { name: 'Упражнения' }))
    expect(screen.getByRole('heading', { name: 'Упражнения' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Удалить Жим лёжа' })).toBeInTheDocument()
  })

  it('показывает ошибку, если API недоступен', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(
      async () => new Response(JSON.stringify({ detail: 'База недоступна' }), { status: 500 }),
    )
    render(<App />)
    expect(await screen.findByRole('alert')).toHaveTextContent('База недоступна')
  })
})
