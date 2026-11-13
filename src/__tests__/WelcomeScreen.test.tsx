import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { WelcomeScreen } from '../components/WelcomeScreen'

const defaultProps = {
  title: 'GH-200: GitHub Actions',
  totalQuestions: 80,
  durationSeconds: 1800,
  onStart: vi.fn(),
}

describe('WelcomeScreen', () => {
  it('renders the exam title', () => {
    render(<WelcomeScreen {...defaultProps} />)
    expect(screen.getByText('GH-200: GitHub Actions')).toBeInTheDocument()
  })

  it('renders description when provided', () => {
    render(<WelcomeScreen {...defaultProps} description="Banco de preguntas de certificación." />)
    expect(screen.getByText('Banco de preguntas de certificación.')).toBeInTheDocument()
  })

  it('does not render description when omitted', () => {
    render(<WelcomeScreen {...defaultProps} />)
    expect(screen.queryByText(/certificación/i)).not.toBeInTheDocument()
  })

  it('shows the number of questions', () => {
    render(<WelcomeScreen {...defaultProps} />)
    expect(screen.getByText(/80/)).toBeInTheDocument()
  })

  it('formats duration in minutes', () => {
    render(<WelcomeScreen {...defaultProps} durationSeconds={1800} />)
    expect(screen.getByText(/30 minutes/i)).toBeInTheDocument()
  })

  it('shows "No time limit" when durationSeconds is 0', () => {
    render(<WelcomeScreen {...defaultProps} durationSeconds={0} />)
    expect(screen.getByText(/no time limit/i)).toBeInTheDocument()
  })

  it('shows "No time limit" when durationSeconds is -1', () => {
    render(<WelcomeScreen {...defaultProps} durationSeconds={-1} />)
    expect(screen.getByText(/no time limit/i)).toBeInTheDocument()
  })

  it('renders the Start exam button', () => {
    render(<WelcomeScreen {...defaultProps} />)
    expect(screen.getByRole('button', { name: /start exam/i })).toBeInTheDocument()
  })

  it('calls onStart when Start exam is clicked', async () => {
    const onStart = vi.fn()
    render(<WelcomeScreen {...defaultProps} onStart={onStart} />)
    await userEvent.click(screen.getByRole('button', { name: /start exam/i }))
    expect(onStart).toHaveBeenCalledOnce()
  })

  it('mentions random order', () => {
    render(<WelcomeScreen {...defaultProps} />)
    expect(screen.getByText(/random order/i)).toBeInTheDocument()
  })

  it('offers timed and practice modes', () => {
    render(<WelcomeScreen {...defaultProps} />)
    expect(screen.getByRole('radiogroup', { name: /exam mode/i })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /timed/i })).toBeChecked()
    expect(screen.getByRole('radio', { name: /practice/i })).not.toBeChecked()
  })

  it('notifies the selected mode', async () => {
    const onModeChange = vi.fn()
    render(<WelcomeScreen {...defaultProps} onModeChange={onModeChange} />)
    await userEvent.click(screen.getByRole('radio', { name: /practice/i }))
    expect(onModeChange).toHaveBeenCalledWith('practice')
  })

  it('labels the action as Start practice in practice mode', () => {
    render(<WelcomeScreen {...defaultProps} mode="practice" />)
    expect(screen.getByRole('button', { name: /start practice/i })).toBeInTheDocument()
  })

  it('hides the mode selector when the exam has no time limit', () => {
    render(<WelcomeScreen {...defaultProps} durationSeconds={0} />)
    expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument()
    expect(screen.getByText(/no time limit/i)).toBeInTheDocument()
  })
})
