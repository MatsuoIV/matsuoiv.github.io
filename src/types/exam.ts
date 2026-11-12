export interface Option {
  id: string
  /** Display text. Null when the option is represented solely by an image. */
  text: string | null
  /** Optional image path (relative to public/). Shown below text if both present. */
  image?: string
  /** Why this option is correct or incorrect. Shown in the result summary. */
  rationale?: string
}

export interface Question {
  id: string
  text: string
  /** Optional image path (relative to public/). Shown below the question text. */
  image?: string
  options: Option[]
  /** One id = single answer (radio). Multiple ids = multi-answer (checkbox). */
  correctAnswers: string[]
  explanation?: string
}

export interface ExamData {
  title: string
  description?: string
  questions: Question[]
}

export type UserAnswers = Record<string, string[]>

export type ExamPhase = 'loading' | 'welcome' | 'exam' | 'summary'

export interface ExamEntry {
  id: string
  title: string
  description?: string
  /** Path relative to public/data/. */
  file: string
  questionCount: number
  /** Duration in minutes. Falls back to VITE_EXAM_DURATION_MINUTES when omitted. */
  durationMinutes?: number
}
