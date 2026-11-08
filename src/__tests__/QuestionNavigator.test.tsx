import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QuestionNavigator } from '../components/QuestionNavigator'
import type { Question, UserAnswers } from '../types/exam'

function makeQuestions(n: number): Question[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `q${i + 1}`,
    text: `Question ${i + 1}`,
    options: [],
    correctAnswers: [`o${i + 1}`],
  }))
}

const questions = makeQuestions(5)

describe('QuestionNavigator', () => {
  it('renders a button for each question', () => {
    render(
      <QuestionNavigator
        questions={questions}
        currentIndex={0}
        userAnswers={{}}
        onGoTo={vi.fn()}
      />
    )
    expect(screen.getAllByRole('listitem')).toHaveLength(5)
  })

  it('marks the current question with --current class', () => {
    render(
      <QuestionNavigator
        questions={questions}
        currentIndex={2}
        userAnswers={{}}
        onGoTo={vi.fn()}
      />
    )
    const buttons = screen.getAllByRole('listitem')
    expect(buttons[2].className).toContain('navigator-btn--current')
    expect(buttons[0].className).toContain('navigator-btn--unanswered')
  })

  it('marks answered questions with --answered class', () => {
    const userAnswers: UserAnswers = { q2: ['o2'], q4: ['o4'] }
    render(
      <QuestionNavigator
        questions={questions}
        currentIndex={0}
        userAnswers={userAnswers}
        onGoTo={vi.fn()}
      />
    )
    const buttons = screen.getAllByRole('listitem')
    expect(buttons[1].className).toContain('navigator-btn--answered')
    expect(buttons[3].className).toContain('navigator-btn--answered')
    expect(buttons[2].className).toContain('navigator-btn--unanswered')
  })

  it('current takes precedence over answered', () => {
    const userAnswers: UserAnswers = { q3: ['o3'] }
    render(
      <QuestionNavigator
        questions={questions}
        currentIndex={2}
        userAnswers={userAnswers}
        onGoTo={vi.fn()}
      />
    )
    const buttons = screen.getAllByRole('listitem')
    expect(buttons[2].className).toContain('navigator-btn--current')
    expect(buttons[2].className).not.toContain('navigator-btn--answered')
  })

  it('calls onGoTo with the correct index when a button is clicked', async () => {
    const onGoTo = vi.fn()
    render(
      <QuestionNavigator
        questions={questions}
        currentIndex={0}
        userAnswers={{}}
        onGoTo={onGoTo}
      />
    )
    await userEvent.click(screen.getAllByRole('listitem')[3])
    expect(onGoTo).toHaveBeenCalledWith(3)
  })

  it('shows answered count in the toggle', () => {
    const userAnswers: UserAnswers = { q1: ['o1'], q3: ['o3'] }
    render(
      <QuestionNavigator
        questions={questions}
        currentIndex={0}
        userAnswers={userAnswers}
        onGoTo={vi.fn()}
      />
    )
    expect(screen.getByText(/2 \/ 5 answered/i)).toBeInTheDocument()
  })

  it('collapses and expands the grid when the toggle is clicked', async () => {
    render(
      <QuestionNavigator
        questions={questions}
        currentIndex={0}
        userAnswers={{}}
        onGoTo={vi.fn()}
      />
    )
    // Grid is open by default
    expect(screen.getAllByRole('listitem')).toHaveLength(5)

    await userEvent.click(screen.getByRole('button', { name: /question map/i }))
    expect(screen.queryAllByRole('listitem')).toHaveLength(0)

    await userEvent.click(screen.getByRole('button', { name: /question map/i }))
    expect(screen.getAllByRole('listitem')).toHaveLength(5)
  })
})
