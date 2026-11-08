import { useState } from 'react'
import type { Question, UserAnswers } from '../types/exam'

interface QuestionNavigatorProps {
  questions: Question[]
  currentIndex: number
  userAnswers: UserAnswers
  onGoTo: (index: number) => void
}

export function QuestionNavigator({
  questions,
  currentIndex,
  userAnswers,
  onGoTo,
}: QuestionNavigatorProps) {
  const [isOpen, setIsOpen] = useState(() => window.innerWidth >= 640)

  const answeredCount = questions.filter((q) => (userAnswers[q.id] ?? []).length > 0).length

  return (
    <div className="navigator">
      <button
        className="navigator-toggle"
        onClick={() => setIsOpen((o) => !o)}
        aria-expanded={isOpen}
      >
        <span>Question map</span>
        <span className="navigator-toggle-meta">
          {answeredCount} / {questions.length} answered
        </span>
        <span className="navigator-toggle-arrow">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="navigator-grid" role="list">
          {questions.map((question, index) => {
            const answered = (userAnswers[question.id] ?? []).length > 0
            const isCurrent = index === currentIndex

            let state: 'current' | 'answered' | 'unanswered'
            if (isCurrent) state = 'current'
            else if (answered) state = 'answered'
            else state = 'unanswered'

            return (
              <button
                key={question.id}
                role="listitem"
                className={`navigator-btn navigator-btn--${state}`}
                onClick={() => onGoTo(index)}
                aria-label={`Go to question ${index + 1}${answered ? ', answered' : ''}`}
                aria-current={isCurrent ? 'true' : undefined}
              >
                {index + 1}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
