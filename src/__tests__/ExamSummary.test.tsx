import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ExamSummary } from '../components/ExamSummary'
import type { ExamData } from '../types/exam'
// ExamData is used both in the top-level fixture and inline within tests

const examData: ExamData = {
  title: 'Test',
  questions: [
    {
      id: 'q1',
      text: 'Question 1',
      options: [
        { id: 'a', text: 'Option A' },
        { id: 'b', text: 'Option B' },
      ],
      correctAnswers: ['a'],
      explanation: 'Because A is correct.',
    },
    {
      id: 'q2',
      text: 'Question 2',
      options: [
        { id: 'a', text: 'Option A' },
        { id: 'b', text: 'Option B' },
        { id: 'c', text: 'Option C' },
      ],
      correctAnswers: ['b', 'c'],
    },
  ],
}

describe('ExamSummary', () => {
  it('renders score percentage and detail', () => {
    render(
      <ExamSummary
        examData={examData}
        userAnswers={{ q1: ['a'], q2: ['b', 'c'] }}
        score={{ correct: 2, total: 2, percentage: 100 }}
        isAnswerCorrect={() => true}
        onRestart={vi.fn()}
      />
    )
    expect(screen.getByText('100%')).toBeInTheDocument()
    expect(screen.getByText('2 of 2 correct')).toBeInTheDocument()
  })

  it('shows explanation when available', () => {
    render(
      <ExamSummary
        examData={examData}
        userAnswers={{ q1: ['a'] }}
        score={{ correct: 1, total: 2, percentage: 50 }}
        isAnswerCorrect={(id) => id === 'q1'}
        onRestart={vi.fn()}
      />
    )
    expect(screen.getByText('Because A is correct.')).toBeInTheDocument()
  })

  it('shows correct answer for wrong responses', () => {
    render(
      <ExamSummary
        examData={examData}
        userAnswers={{ q1: ['b'] }}
        score={{ correct: 0, total: 2, percentage: 0 }}
        isAnswerCorrect={() => false}
        onRestart={vi.fn()}
      />
    )
    expect(screen.getAllByText('Correct answer:').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Option A').length).toBeGreaterThan(0)
  })

  it('shows "No answer" when no answer was given', () => {
    render(
      <ExamSummary
        examData={examData}
        userAnswers={{}}
        score={{ correct: 0, total: 2, percentage: 0 }}
        isAnswerCorrect={() => false}
        onRestart={vi.fn()}
      />
    )
    expect(screen.getAllByText('No answer')).toHaveLength(2)
  })

  it('shows "Option X" label for image-only options in the summary', () => {
    const examWithImageOptions: ExamData = {
      title: 'Test',
      questions: [{
        id: 'q1',
        text: 'Pick the right workflow',
        options: [
          { id: 'a', text: null, image: '/data/images/q1-a.png' },
          { id: 'b', text: null, image: '/data/images/q1-b.png' },
        ],
        correctAnswers: ['b'],
      }],
    }
    render(
      <ExamSummary
        examData={examWithImageOptions}
        userAnswers={{ q1: ['a'] }}
        score={{ correct: 0, total: 1, percentage: 0 }}
        isAnswerCorrect={() => false}
        onRestart={vi.fn()}
      />
    )
    // Given answer label falls back to "Option A"
    expect(screen.getByText('Option A')).toBeInTheDocument()
    // Correct answer label falls back to "Option B"
    expect(screen.getByText('Option B')).toBeInTheDocument()
  })

  it('renders question image in summary when present', () => {
    const examWithQuestionImage: ExamData = {
      title: 'Test',
      questions: [{
        id: 'q1',
        text: 'What does this show?',
        image: '/data/images/q1.png',
        options: [{ id: 'a', text: 'Answer A' }],
        correctAnswers: ['a'],
      }],
    }
    render(
      <ExamSummary
        examData={examWithQuestionImage}
        userAnswers={{ q1: ['a'] }}
        score={{ correct: 1, total: 1, percentage: 100 }}
        isAnswerCorrect={() => true}
        onRestart={vi.fn()}
      />
    )
    expect(screen.getByAltText(/image for question/i)).toHaveAttribute('src', '/data/images/q1.png')
  })

  it('calls onRestart when button is clicked', async () => {
    const onRestart = vi.fn()
    render(
      <ExamSummary
        examData={examData}
        userAnswers={{}}
        score={{ correct: 0, total: 2, percentage: 0 }}
        isAnswerCorrect={() => false}
        onRestart={onRestart}
      />
    )
    await userEvent.click(screen.getByText('Restart exam'))
    expect(onRestart).toHaveBeenCalledOnce()
  })
})
