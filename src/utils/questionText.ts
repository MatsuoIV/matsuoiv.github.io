export interface TextBlock {
  type: 'text'
  content: string
}

export interface CodeBlock {
  type: 'code'
  code: string
  language?: string
  lineNumbers: boolean
}

export type QuestionBlock = TextBlock | CodeBlock

/**
 * Matches fenced code blocks inside the question text:
 *
 * ```js linenums
 * const answer = 42
 * ```
 *
 * The info string accepts a language and the optional `linenums` flag.
 */
const FENCE_PATTERN = /```([^\n`]*)\n([\s\S]*?)```/g

/**
 * Splits a question text into plain-text and code blocks.
 *
 * Plain text keeps inline Markdown code spans (`like this`) and blank-line
 * separated paragraphs. A fenced block without a closing fence is rendered as
 * plain text, so malformed content is still readable.
 */
export function parseQuestionText(source: string): QuestionBlock[] {
  const blocks: QuestionBlock[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  FENCE_PATTERN.lastIndex = 0

  while ((match = FENCE_PATTERN.exec(source)) !== null) {
    if (match.index > lastIndex) {
      blocks.push({ type: 'text', content: source.slice(lastIndex, match.index) })
    }

    const info = match[1].trim().split(/\s+/).filter(Boolean)
    const lineNumbers = info.includes('linenums')
    const language = info.find((token) => token !== 'linenums')
    const rawCode = match[2]
    // Drop the single newline that authors add before the closing fence.
    const code = rawCode.endsWith('\n') ? rawCode.slice(0, -1) : rawCode

    blocks.push({ type: 'code', code, language, lineNumbers })
    lastIndex = FENCE_PATTERN.lastIndex
  }

  if (lastIndex < source.length) {
    blocks.push({ type: 'text', content: source.slice(lastIndex) })
  }

  if (blocks.length === 0) {
    blocks.push({ type: 'text', content: source })
  }

  return blocks
}

const NUMBER_WORDS = [
  'zero',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
]

/** Builds the hint shown for multi-answer questions, e.g. "Select the two correct options." */
export function multipleAnswerHint(count: number): string {
  const word = NUMBER_WORDS[count] ?? String(count)
  return `Select the ${word} correct option${count === 1 ? '' : 's'}.`
}
