import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ExamQuestion } from '../components/ExamQuestion'
import type { Question } from '../types/exam'

const singleQuestion: Question = {
  id: 'q1',
  text: 'Which is correct?',
  options: [
    { id: 'a', text: 'Answer A' },
    { id: 'b', text: 'Answer B' },
  ],
  correctAnswers: ['a'],
}

const multiQuestion: Question = {
  id: 'q2',
  text: 'Select all that apply',
  options: [
    { id: 'a', text: 'Answer A' },
    { id: 'b', text: 'Answer B' },
    { id: 'c', text: 'Answer C' },
  ],
  correctAnswers: ['a', 'c'],
}

const questionWithImage: Question = {
  id: 'q3',
  text: 'Which code block is shown?',
  image: '/data/images/q3.png',
  options: [
    { id: 'a', text: 'Option A' },
    { id: 'b', text: 'Option B' },
  ],
  correctAnswers: ['a'],
}

const questionWithOptionImages: Question = {
  id: 'q4',
  text: 'Which option shows the correct workflow?',
  options: [
    { id: 'a', text: null, image: '/data/images/q4-a.png' },
    { id: 'b', text: null, image: '/data/images/q4-b.png' },
  ],
  correctAnswers: ['b'],
}

const questionWithMixedOption: Question = {
  id: 'q5',
  text: 'Select the correct answer',
  options: [
    { id: 'a', text: 'Text and image', image: '/data/images/q5-a.png' },
    { id: 'b', text: 'Text only' },
  ],
  correctAnswers: ['a'],
}

const defaultProps = {
  questionNumber: 1,
  totalQuestions: 5,
  userAnswers: {},
  onToggleAnswer: vi.fn(),
  onPrev: vi.fn(),
  onNext: vi.fn(),
  onSubmit: vi.fn(),
  isFirst: false,
  isLast: false,
}

describe('ExamQuestion — single answer', () => {
  it('renders question text and options', () => {
    render(<ExamQuestion {...defaultProps} question={singleQuestion} />)
    expect(screen.getByText('Which is correct?')).toBeInTheDocument()
    expect(screen.getByText('Answer A')).toBeInTheDocument()
    expect(screen.getByText('Answer B')).toBeInTheDocument()
  })

  it('uses radio inputs for single-answer questions', () => {
    render(<ExamQuestion {...defaultProps} question={singleQuestion} />)
    const radios = screen.getAllByRole('radio')
    expect(radios).toHaveLength(2)
  })

  it('does not show the multi-select hint for single-answer questions', () => {
    render(<ExamQuestion {...defaultProps} question={singleQuestion} />)
    expect(screen.queryByText(/select all correct/i)).not.toBeInTheDocument()
  })

  it('calls onToggleAnswer when an option is clicked', async () => {
    const onToggleAnswer = vi.fn()
    render(<ExamQuestion {...defaultProps} question={singleQuestion} onToggleAnswer={onToggleAnswer} />)
    await userEvent.click(screen.getByText('Answer A'))
    expect(onToggleAnswer).toHaveBeenCalledWith('q1', 'a')
  })
})

describe('ExamQuestion — multiple answer', () => {
  it('uses checkbox inputs for multi-answer questions', () => {
    render(<ExamQuestion {...defaultProps} question={multiQuestion} />)
    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes).toHaveLength(3)
  })

  it('shows the multi-select hint', () => {
    render(<ExamQuestion {...defaultProps} question={multiQuestion} />)
    expect(screen.getByText(/select all correct/i)).toBeInTheDocument()
  })
})

describe('ExamQuestion — images', () => {
  it('renders question image when provided', () => {
    render(<ExamQuestion {...defaultProps} question={questionWithImage} />)
    const img = screen.getByAltText(/supporting image/i)
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', '/data/images/q3.png')
  })

  it('does not render question image when not provided', () => {
    render(<ExamQuestion {...defaultProps} question={singleQuestion} />)
    expect(screen.queryByAltText(/supporting image/i)).not.toBeInTheDocument()
  })

  it('renders option images when options have image field', () => {
    render(<ExamQuestion {...defaultProps} question={questionWithOptionImages} />)
    expect(screen.getByAltText('Option A')).toHaveAttribute('src', '/data/images/q4-a.png')
    expect(screen.getByAltText('Option B')).toHaveAttribute('src', '/data/images/q4-b.png')
  })

  it('renders both text and image when option has both', () => {
    render(<ExamQuestion {...defaultProps} question={questionWithMixedOption} />)
    expect(screen.getByText('Text and image')).toBeInTheDocument()
    expect(screen.getByAltText('Text and image')).toHaveAttribute('src', '/data/images/q5-a.png')
  })

  it('clicking an image-only option calls onToggleAnswer', async () => {
    const onToggleAnswer = vi.fn()
    render(<ExamQuestion {...defaultProps} question={questionWithOptionImages} onToggleAnswer={onToggleAnswer} />)
    await userEvent.click(screen.getByAltText('Option A'))
    expect(onToggleAnswer).toHaveBeenCalledWith('q4', 'a')
  })
})

describe('ExamQuestion — navigation', () => {
  it('disables Previous on the first question', () => {
    render(<ExamQuestion {...defaultProps} question={singleQuestion} isFirst={true} />)
    expect(screen.getByText('Previous')).toBeDisabled()
  })

  it('shows "Finish exam" on the last question', () => {
    render(<ExamQuestion {...defaultProps} question={singleQuestion} isLast={true} />)
    expect(screen.getByText('Finish exam')).toBeInTheDocument()
  })

  it('shows "Next" when not on the last question', () => {
    render(<ExamQuestion {...defaultProps} question={singleQuestion} isLast={false} />)
    expect(screen.getByText('Next')).toBeInTheDocument()
  })

  it('calls onSubmit when Finish exam is clicked', async () => {
    const onSubmit = vi.fn()
    render(<ExamQuestion {...defaultProps} question={singleQuestion} isLast={true} onSubmit={onSubmit} />)
    await userEvent.click(screen.getByText('Finish exam'))
    expect(onSubmit).toHaveBeenCalledOnce()
  })

  it('calls onNext when Next is clicked', async () => {
    const onNext = vi.fn()
    render(<ExamQuestion {...defaultProps} question={singleQuestion} onNext={onNext} />)
    await userEvent.click(screen.getByText('Next'))
    expect(onNext).toHaveBeenCalledOnce()
  })
})
