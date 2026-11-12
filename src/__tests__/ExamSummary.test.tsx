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
        { id: 'a', text: 'Option A', rationale: 'A satisfies the requirement.' },
        { id: 'b', text: 'Option B', rationale: 'B does not satisfy the requirement.' },
      ],
      correctAnswers: ['a'],
      explanation: 'Because A is correct.',
    },
    {
      id: 'q2',
      text: 'Question 2',
      options: [
        { id: 'a', text: 'Option A', rationale: 'A is out of scope.' },
        { id: 'b', text: 'Option B', rationale: 'B meets the requirement.' },
        { id: 'c', text: 'Option C', rationale: 'C also meets the requirement.' },
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
          { id: 'a', text: null, image: '/data/images/q1-a.png', rationale: 'A is incorrect.' },
          { id: 'b', text: null, image: '/data/images/q1-b.png', rationale: 'B is correct.' },
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
    expect(screen.getAllByText('Option A').length).toBeGreaterThan(0)
    // Correct answer label falls back to "Option B"
    expect(screen.getAllByText('Option B').length).toBeGreaterThan(0)
  })

  it('renders question image in summary when present', () => {
    const examWithQuestionImage: ExamData = {
      title: 'Test',
      questions: [{
        id: 'q1',
        text: 'What does this show?',
        image: '/data/images/q1.png',
        options: [{ id: 'a', text: 'Answer A', rationale: 'A is correct.' }],
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

  it('renders code blocks and inline code in the summary', () => {
    const examWithCode: ExamData = {
      title: 'Test',
      questions: [{
        id: 'q1',
        text: 'Use `runs-on: [gpu]`.\n\n```yaml\nsteps:\n  - run: echo hi\n```',
        options: [{ id: 'a', text: 'Answer A', rationale: 'A is correct.' }],
        correctAnswers: ['a'],
      }],
    }
    render(
      <ExamSummary
        examData={examWithCode}
        userAnswers={{ q1: ['a'] }}
        score={{ correct: 1, total: 1, percentage: 100 }}
        isAnswerCorrect={() => true}
        onRestart={vi.fn()}
      />
    )
    expect(screen.getByText('runs-on: [gpu]')).toHaveClass('inline-code')
    expect(screen.getByText('yaml')).toHaveClass('code-block-language')
    expect(screen.getByText('- run: echo hi').textContent).toBe('  - run: echo hi')
  })

  it('shows a correct/incorrect status for each question', () => {
    render(
      <ExamSummary
        examData={examData}
        userAnswers={{ q1: ['a'], q2: ['a'] }}
        score={{ correct: 1, total: 2, percentage: 50 }}
        isAnswerCorrect={(id) => id === 'q1'}
        onRestart={vi.fn()}
      />
    )
    expect(screen.getByTestId('question-status-1')).toHaveTextContent('Correct')
    expect(screen.getByTestId('question-status-2')).toHaveTextContent('Incorrect')
  })

  it('renders a rationale for every option, including incorrect ones', () => {
    render(
      <ExamSummary
        examData={examData}
        userAnswers={{ q1: ['b'] }}
        score={{ correct: 0, total: 2, percentage: 0 }}
        isAnswerCorrect={() => false}
        onRestart={vi.fn()}
      />
    )
    expect(screen.getByText('A satisfies the requirement.')).toBeInTheDocument()
    expect(screen.getByText('B does not satisfy the requirement.')).toBeInTheDocument()
    expect(screen.getByText('A is out of scope.')).toBeInTheDocument()
    expect(screen.getByText('B meets the requirement.')).toBeInTheDocument()
  })

  it('marks each option as correct or incorrect in the review', () => {
    render(
      <ExamSummary
        examData={examData}
        userAnswers={{ q1: ['a'] }}
        score={{ correct: 1, total: 2, percentage: 50 }}
        isAnswerCorrect={(id) => id === 'q1'}
        onRestart={vi.fn()}
      />
    )
    const review = screen.getAllByText('Review by option')[0].closest('.option-review') as HTMLElement
    expect(review.querySelectorAll('.option-review-item--correct')).toHaveLength(1)
    expect(review.querySelectorAll('.option-review-item--incorrect')).toHaveLength(1)
    expect(document.querySelectorAll('.option-review-item--correct')).toHaveLength(3)
    expect(document.querySelectorAll('.option-review-item--incorrect')).toHaveLength(2)
  })

  it('falls back when an option has no rationale', () => {
    const examWithoutRationale: ExamData = {
      title: 'Test',
      questions: [{
        id: 'q1',
        text: 'Question without rationale',
        options: [{ id: 'a', text: 'Answer A' }],
        correctAnswers: ['a'],
      }],
    }
    render(
      <ExamSummary
        examData={examWithoutRationale}
        userAnswers={{ q1: ['a'] }}
        score={{ correct: 1, total: 1, percentage: 100 }}
        isAnswerCorrect={() => true}
        onRestart={vi.fn()}
      />
    )
    expect(screen.getByText('No rationale available.')).toBeInTheDocument()
  })
})
