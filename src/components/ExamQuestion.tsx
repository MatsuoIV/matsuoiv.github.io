import type { Question, UserAnswers } from '../types/exam'

interface ExamQuestionProps {
  question: Question
  questionNumber: number
  totalQuestions: number
  userAnswers: UserAnswers
  onToggleAnswer: (questionId: string, optionId: string) => void
  onPrev: () => void
  onNext: () => void
  onSubmit: () => void
  isFirst: boolean
  isLast: boolean
}

export function ExamQuestion({
  question,
  questionNumber,
  totalQuestions,
  userAnswers,
  onToggleAnswer,
  onPrev,
  onNext,
  onSubmit,
  isFirst,
  isLast,
}: ExamQuestionProps) {
  const isMultiple = question.correctAnswers.length > 1
  const selected = userAnswers[question.id] ?? []

  return (
    <div className="question-card">
      <p className="question-counter">
        Question {questionNumber} of {totalQuestions}
      </p>
      <h2 className="question-text">{question.text}</h2>
      {question.image && (
        <img
          src={question.image}
          alt={`Supporting image for question ${questionNumber}`}
          className="question-image"
        />
      )}
      {isMultiple && (
        <p className="question-hint">Select all correct options.</p>
      )}

      <ul className="options-list">
        {question.options.map((option) => {
          const checked = selected.includes(option.id)
          const inputType = isMultiple ? 'checkbox' : 'radio'
          const inputId = `${question.id}-${option.id}`

          return (
            <li key={option.id}>
              <label
                htmlFor={inputId}
                className={`option-label${checked ? ' option-label--selected' : ''}`}
              >
                <input
                  id={inputId}
                  type={inputType}
                  name={question.id}
                  value={option.id}
                  checked={checked}
                  onChange={() => onToggleAnswer(question.id, option.id)}
                />
                <span className="option-content">
                  {option.text && <span>{option.text}</span>}
                  {option.image && (
                    <img
                      src={option.image}
                      alt={option.text ?? `Option ${option.id.toUpperCase()}`}
                      className="option-image"
                    />
                  )}
                </span>
              </label>
            </li>
          )
        })}
      </ul>

      <div className="question-actions">
        <button onClick={onPrev} disabled={isFirst} className="btn btn--secondary">
          Previous
        </button>
        {isLast ? (
          <button onClick={onSubmit} className="btn btn--primary">
            Finish exam
          </button>
        ) : (
          <button onClick={onNext} className="btn btn--primary">
            Next
          </button>
        )}
      </div>
    </div>
  )
}
