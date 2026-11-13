import { FeedbackButton } from './FeedbackButton'
import type { ExamMode } from '../types/exam'

interface WelcomeScreenProps {
  title: string
  description?: string
  totalQuestions: number
  durationSeconds: number   // -1 = sin límite
  mode?: ExamMode
  onModeChange?: (mode: ExamMode) => void
  onStart: () => void
  /** Optional: return to the exam picker. */
  onChangeExam?: () => void
}

function formatDuration(seconds: number): string {
  if (seconds <= 0) return 'No time limit'
  const minutes = Math.round(seconds / 60)
  return `${minutes} minutes`
}

export function WelcomeScreen({
  title,
  description,
  totalQuestions,
  durationSeconds,
  mode = 'timed',
  onModeChange,
  onStart,
  onChangeExam,
}: WelcomeScreenProps) {
  const hasTimeLimit = durationSeconds > 0
  const isPractice = mode === 'practice' || !hasTimeLimit

  return (
    <div className="welcome">
      <div className="welcome-card">
        <h1 className="welcome-title">{title}</h1>
        {description && <p className="welcome-description">{description}</p>}

        <ul className="welcome-meta">
          <li>
            <span className="welcome-meta-icon">📋</span>
            <span><strong>{totalQuestions}</strong> questions</span>
          </li>
          {!hasTimeLimit && (
            <li>
              <span className="welcome-meta-icon">∞</span>
              <span>No time limit</span>
            </li>
          )}
          <li>
            <span className="welcome-meta-icon">🔀</span>
            <span>Questions presented in random order</span>
          </li>
        </ul>

        {hasTimeLimit && (
          <div className="exam-mode" role="radiogroup" aria-label="Exam mode">
            <label className={`exam-mode-option${!isPractice ? ' exam-mode-option--active' : ''}`}>
              <input
                type="radio"
                name="exam-mode"
                value="timed"
                checked={!isPractice}
                onChange={() => onModeChange?.('timed')}
              />
              <span className="exam-mode-icon" aria-hidden="true">⏱</span>
              <span className="exam-mode-copy">
                <span className="exam-mode-label">Timed</span>
                <span className="exam-mode-detail">{formatDuration(durationSeconds)}</span>
              </span>
            </label>

            <label className={`exam-mode-option${isPractice ? ' exam-mode-option--active' : ''}`}>
              <input
                type="radio"
                name="exam-mode"
                value="practice"
                checked={isPractice}
                onChange={() => onModeChange?.('practice')}
              />
              <span className="exam-mode-icon" aria-hidden="true">∞</span>
              <span className="exam-mode-copy">
                <span className="exam-mode-label">Practice</span>
                <span className="exam-mode-detail">No time limit</span>
              </span>
            </label>
          </div>
        )}

        <button className="btn btn--primary btn--large" onClick={onStart}>
          {isPractice ? 'Start practice' : 'Start exam'}
        </button>

        {onChangeExam && (
          <button className="btn btn--ghost" onClick={onChangeExam}>
            ← Change exam
          </button>
        )}
      </div>

      <FeedbackButton />

      <footer className="welcome-footer">
        Made with love, patience, Sertraline and Chicken Soup
      </footer>
    </div>
  )
}
