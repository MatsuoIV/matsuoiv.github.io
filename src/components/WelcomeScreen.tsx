import { FeedbackButton } from './FeedbackButton'

interface WelcomeScreenProps {
  title: string
  description?: string
  totalQuestions: number
  durationSeconds: number   // -1 = sin límite
  onStart: () => void
  /** Optional: return to the exam picker. */
  onChangeExam?: () => void
}

function formatDuration(seconds: number): string {
  if (seconds <= 0) return 'Sin límite de tiempo'
  const minutes = Math.round(seconds / 60)
  return `${minutes} minutos`
}

export function WelcomeScreen({
  title,
  description,
  totalQuestions,
  durationSeconds,
  onStart,
  onChangeExam,
}: WelcomeScreenProps) {
  return (
    <div className="welcome">
      <div className="welcome-card">
        <h1 className="welcome-title">{title}</h1>
        {description && <p className="welcome-description">{description}</p>}

        <ul className="welcome-meta">
          <li>
            <span className="welcome-meta-icon">📋</span>
            <span><strong>{totalQuestions}</strong> preguntas</span>
          </li>
          <li>
            <span className="welcome-meta-icon">⏱</span>
            <span>{formatDuration(durationSeconds)}</span>
          </li>
          <li>
            <span className="welcome-meta-icon">🔀</span>
            <span>Preguntas en orden aleatorio</span>
          </li>
        </ul>

        <button className="btn btn--primary btn--large" onClick={onStart}>
          Iniciar examen
        </button>

        {onChangeExam && (
          <button className="btn btn--ghost" onClick={onChangeExam}>
            ← Cambiar examen
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
