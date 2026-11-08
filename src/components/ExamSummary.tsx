import type { ExamData, Option, UserAnswers } from '../types/exam'
import { FeedbackButton } from './FeedbackButton'

interface ExamSummaryProps {
  examData: ExamData
  userAnswers: UserAnswers
  score: { correct: number; total: number; percentage: number }
  isAnswerCorrect: (questionId: string) => boolean
  onRestart: () => void
}

/** Returns the display label for an option (text or "Option X" fallback). */
function optionLabel(option: Option): string {
  return option.text ?? `Option ${option.id.toUpperCase()}`
}

export function ExamSummary({
  examData,
  userAnswers,
  score,
  isAnswerCorrect,
  onRestart,
}: ExamSummaryProps) {
  return (
    <div className="summary">
      <div className="summary-header">
        <h1>Your result</h1>
        <div className="score-badge" data-passing={score.percentage >= 60}>
          <span className="score-value">{score.percentage}%</span>
          <span className="score-detail">
            {score.correct} of {score.total} correct
          </span>
        </div>
      </div>

      <ol className="summary-list">
        {examData.questions.map((question, index) => {
          const correct = isAnswerCorrect(question.id)
          const givenIds = userAnswers[question.id] ?? []

          const givenOptions = givenIds.map(
            (id) => question.options.find((o) => o.id === id)
          ).filter(Boolean) as Option[]

          const correctOptions = question.correctAnswers.map(
            (id) => question.options.find((o) => o.id === id)
          ).filter(Boolean) as Option[]

          return (
            <li key={question.id} className={`summary-item${correct ? ' summary-item--correct' : ' summary-item--wrong'}`}>
              <p className="summary-item-number">Question {index + 1}</p>
              <p className="summary-item-text">{question.text}</p>
              {question.image && (
                <img
                  src={question.image}
                  alt={`Image for question ${index + 1}`}
                  className="question-image question-image--summary"
                />
              )}

              <div className="summary-answers">
                <div className="summary-answer">
                  <span className="summary-answer-label">Your answer:</span>
                  {givenOptions.length > 0 ? (
                    <span className={`summary-answer-value${correct ? ' correct' : ' wrong'}`}>
                      {givenOptions.map((o) => optionLabel(o)).join(', ')}
                      {givenOptions.some((o) => o.image) && (
                        <span className="summary-answer-images">
                          {givenOptions.filter((o) => o.image).map((o) => (
                            <img
                              key={o.id}
                              src={o.image}
                              alt={optionLabel(o)}
                              className="option-image option-image--summary"
                            />
                          ))}
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="summary-answer-value wrong">No answer</span>
                  )}
                </div>

                {!correct && (
                  <div className="summary-answer">
                    <span className="summary-answer-label">Correct answer:</span>
                    <span className="summary-answer-value correct">
                      {correctOptions.map((o) => optionLabel(o)).join(', ')}
                      {correctOptions.some((o) => o.image) && (
                        <span className="summary-answer-images">
                          {correctOptions.filter((o) => o.image).map((o) => (
                            <img
                              key={o.id}
                              src={o.image}
                              alt={optionLabel(o)}
                              className="option-image option-image--summary"
                            />
                          ))}
                        </span>
                      )}
                    </span>
                  </div>
                )}
              </div>

              {question.explanation && (
                <p className="summary-explanation">{question.explanation}</p>
              )}
            </li>
          )
        })}
      </ol>

      <div className="summary-footer">
        <button onClick={onRestart} className="btn btn--primary">
          Restart exam
        </button>
        <FeedbackButton />
      </div>
    </div>
  )
}
