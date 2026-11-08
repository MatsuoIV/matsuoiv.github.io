import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ExamTimer, formatTime } from '../components/ExamTimer'

describe('formatTime', () => {
  it('formats zero as 00:00', () => {
    expect(formatTime(0)).toBe('00:00')
  })

  it('formats seconds only', () => {
    expect(formatTime(45)).toBe('00:45')
  })

  it('formats minutes and seconds', () => {
    expect(formatTime(90)).toBe('01:30')
  })

  it('pads single-digit values', () => {
    expect(formatTime(61)).toBe('01:01')
  })

  it('formats large values', () => {
    expect(formatTime(3600)).toBe('60:00')
  })
})

describe('ExamTimer', () => {
  it('renders nothing when timeLeft is -1 (no limit)', () => {
    const { container } = render(<ExamTimer timeLeft={-1} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders formatted time', () => {
    render(<ExamTimer timeLeft={125} />)
    expect(screen.getByText('02:05')).toBeInTheDocument()
  })

  it('does not apply urgent style above 60 seconds', () => {
    const { container } = render(<ExamTimer timeLeft={61} />)
    expect(container.firstChild).not.toHaveClass('exam-timer--urgent')
  })

  it('applies urgent style at exactly 60 seconds', () => {
    const { container } = render(<ExamTimer timeLeft={60} />)
    expect(container.firstChild).toHaveClass('exam-timer--urgent')
  })

  it('applies urgent style below 60 seconds', () => {
    const { container } = render(<ExamTimer timeLeft={30} />)
    expect(container.firstChild).toHaveClass('exam-timer--urgent')
  })

  it('has accessible aria-label with formatted time', () => {
    render(<ExamTimer timeLeft={90} />)
    expect(screen.getByLabelText('Time remaining: 01:30')).toBeInTheDocument()
  })
})
