interface ExamTimerProps {
  timeLeft: number  // segundos; -1 = sin límite
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function ExamTimer({ timeLeft }: ExamTimerProps) {
  if (timeLeft < 0) return null

  const isUrgent = timeLeft <= 60

  return (
    <div
      className={`exam-timer${isUrgent ? ' exam-timer--urgent' : ''}`}
      aria-live="polite"
      aria-label={`Time remaining: ${formatTime(timeLeft)}`}
    >
      <span className="exam-timer-icon">⏱</span>
      <span className="exam-timer-value">{formatTime(timeLeft)}</span>
    </div>
  )
}

export { formatTime }
