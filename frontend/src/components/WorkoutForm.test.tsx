import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import type { Exercise } from '../types'
import WorkoutForm from './WorkoutForm'

const exercises: Exercise[] = [
  { id: 1, name: 'Жим лёжа', muscle_group: 'Грудь' },
  { id: 2, name: 'Присед', muscle_group: 'Ноги' },
]

describe('WorkoutForm', () => {
  it('просит добавить упражнения, если список пуст', () => {
    render(<WorkoutForm exercises={[]} onSubmit={vi.fn()} />)
    expect(screen.getByText(/Сначала добавьте упражнения/)).toBeInTheDocument()
  })

  it('кнопка сохранения неактивна без названия и подходов', () => {
    render(<WorkoutForm exercises={exercises} onSubmit={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Сохранить' })).toBeDisabled()
  })

  it('отправляет тренировку с подходами', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(true)
    render(<WorkoutForm exercises={exercises} onSubmit={onSubmit} />)

    await user.type(screen.getByPlaceholderText(/Грудь \+ трицепс/), 'Грудь')
    await user.selectOptions(screen.getByLabelText('Упражнение 1'), '1')
    await user.type(screen.getByLabelText('Повторы 1'), '8')
    await user.type(screen.getByLabelText('Вес 1'), '50')

    await user.click(screen.getByRole('button', { name: '+ Подход' }))
    // новый подход наследует упражнение из предыдущей строки
    expect(screen.getByLabelText('Упражнение 2')).toHaveValue('1')
    await user.type(screen.getByLabelText('Повторы 2'), '6')
    await user.type(screen.getByLabelText('Вес 2'), '55')

    expect(screen.getByText(/Тоннаж: 730 кг/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Сохранить' }))

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Грудь',
        sets: [
          { exercise_id: 1, reps: 8, weight: 50 },
          { exercise_id: 1, reps: 6, weight: 55 },
        ],
      }),
    )
    // после успешной отправки форма очищается
    expect(screen.getByPlaceholderText(/Грудь \+ трицепс/)).toHaveValue('')
  })
})
