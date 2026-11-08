import type { ExamEntry } from '../types/exam'
import { FeedbackButton } from './FeedbackButton'

interface ExamPickerProps {
  exams: ExamEntry[]
  loading: boolean
  error: string | null
  onSelect: (exam: ExamEntry) => void
}

export function ExamPicker({ exams, loading, error, onSelect }: ExamPickerProps) {
  return (
    <div className="welcome">
      <div className="exam-picker">
        <header className="exam-picker-header">
          <h1 className="welcome-title">Choose an exam</h1>
          <p className="welcome-description">
            Select the question bank you want to practice with.
          </p>
        </header>

        {loading && <p className="exam-picker-status">Loading exams…</p>}
        {error && <p className="exam-picker-status exam-picker-error">{error}</p>}

        <ul className="exam-list">
          {exams.map((exam) => (
            <li key={exam.id}>
              <button className="exam-card" onClick={() => onSelect(exam)}>
                <span className="exam-card-title">{exam.title}</span>
                {exam.description && (
                  <span className="exam-card-description">{exam.description}</span>
                )}
                <span className="exam-card-meta">{exam.questionCount} questions</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <FeedbackButton />

      <footer className="welcome-footer">
        Made with love, patience, Sertraline and Chicken Soup
      </footer>
    </div>
  )
}
