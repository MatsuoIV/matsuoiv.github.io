import { useEffect, useState } from 'react'
import { useExam } from './hooks/useExam'
import { ProgressBar } from './components/ProgressBar'
import { ExamQuestion } from './components/ExamQuestion'
import { ExamSummary } from './components/ExamSummary'
import { ExamTimer } from './components/ExamTimer'
import { WelcomeScreen } from './components/WelcomeScreen'
import { ExamPicker } from './components/ExamPicker'
import { QuestionNavigator } from './components/QuestionNavigator'
import { EXAM_DURATION_SECONDS } from './config'
import type { ExamEntry } from './types/exam'
import './App.css'

export default function App() {
  const [exams, setExams] = useState<ExamEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedExam, setSelectedExam] = useState<ExamEntry | null>(null)

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/exams.json`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((data: { exams: ExamEntry[] }) => setExams(data.exams ?? []))
      .catch(() => setError('No se pudo cargar la lista de exámenes.'))
      .finally(() => setLoading(false))
  }, [])

  if (!selectedExam) {
    return (
      <ExamPicker
        exams={exams}
        loading={loading}
        error={error}
        onSelect={setSelectedExam}
      />
    )
  }

  return (
    <ExamRunner
      key={selectedExam.id}
      exam={selectedExam}
      onChangeExam={() => setSelectedExam(null)}
    />
  )
}

interface ExamRunnerProps {
  exam: ExamEntry
  onChangeExam: () => void
}

function ExamRunner({ exam, onChangeExam }: ExamRunnerProps) {
  const {
    phase,
    examData,
    shuffledQuestions,
    currentIndex,
    currentQuestion,
    totalQuestions,
    userAnswers,
    isLastQuestion,
    timeLeft,
    toggleAnswer,
    goNext,
    goPrev,
    goTo,
    startExam,
    submitExam,
    restartExam,
    getScore,
    isAnswerCorrect,
  } = useExam(`${import.meta.env.BASE_URL}data/${exam.file}`, EXAM_DURATION_SECONDS)

  if (phase === 'loading') {
    return (
      <div className="app-center">
        <p>Cargando examen...</p>
      </div>
    )
  }

  if (!examData) {
    return (
      <div className="app-center">
        <p>No se pudo cargar el examen.</p>
      </div>
    )
  }

  if (phase === 'welcome') {
    return (
      <WelcomeScreen
        title={examData.title}
        description={examData.description}
        totalQuestions={examData.questions.length}
        durationSeconds={EXAM_DURATION_SECONDS}
        onStart={startExam}
        onChangeExam={onChangeExam}
      />
    )
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-top">
          <h1 className="app-title">{examData.title}</h1>
          {phase === 'exam' && <ExamTimer timeLeft={timeLeft} />}
        </div>
      </header>

      <main className="app-main">
        {phase === 'exam' && currentQuestion && (
          <>
            <ProgressBar current={currentIndex + 1} total={totalQuestions} />
            <QuestionNavigator
              questions={shuffledQuestions}
              currentIndex={currentIndex}
              userAnswers={userAnswers}
              onGoTo={goTo}
            />
            <ExamQuestion
              question={currentQuestion}
              questionNumber={currentIndex + 1}
              totalQuestions={totalQuestions}
              userAnswers={userAnswers}
              onToggleAnswer={toggleAnswer}
              onPrev={goPrev}
              onNext={goNext}
              onSubmit={submitExam}
              isFirst={currentIndex === 0}
              isLast={isLastQuestion}
            />
          </>
        )}

        {phase === 'summary' && (
          <ExamSummary
            examData={examData}
            userAnswers={userAnswers}
            score={getScore()}
            isAnswerCorrect={isAnswerCorrect}
            onRestart={restartExam}
          />
        )}
      </main>
    </div>
  )
}
