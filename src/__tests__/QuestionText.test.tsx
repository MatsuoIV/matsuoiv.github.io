import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QuestionText } from '../components/QuestionText'
import { multipleAnswerHint, parseQuestionText } from '../utils/questionText'

describe('parseQuestionText', () => {
  it('keeps plain text as a single block', () => {
    const blocks = parseQuestionText('Which option is correct?')
    expect(blocks).toEqual([{ type: 'text', content: 'Which option is correct?' }])
  })

  it('splits text around a fenced code block', () => {
    const blocks = parseQuestionText(
      'Review this snippet:\n\n```js\nconst answer = 42\n```\n\nWhat does it return?'
    )
    expect(blocks).toHaveLength(3)
    expect(blocks[0]).toMatchObject({ type: 'text' })
    expect(blocks[1]).toMatchObject({
      type: 'code',
      code: 'const answer = 42',
      language: 'js',
      lineNumbers: false,
    })
    expect(blocks[2]).toMatchObject({ type: 'text' })
  })

  it('detects the linenums flag and keeps blank lines', () => {
    const blocks = parseQuestionText(
      '```yaml linenums\nsteps:\n  - run: |\n      echo hi\n\n```'
    )
    expect(blocks[0]).toMatchObject({
      type: 'code',
      language: 'yaml',
      lineNumbers: true,
    })
    expect(blocks[0].type === 'code' && blocks[0].code.split('\n')).toHaveLength(4)
  })

  it('parses multiple fenced blocks', () => {
    const blocks = parseQuestionText('A\n\n```js\none\n```\n\nB\n\n```json\n{}\n```')
    expect(blocks.filter((block) => block.type === 'code')).toHaveLength(2)
  })

  it('accepts the linenums flag before the language', () => {
    const blocks = parseQuestionText('```linenums yaml\na: 1\n```')
    expect(blocks[0]).toMatchObject({ type: 'code', language: 'yaml', lineNumbers: true })
  })

  it('renders an unclosed fence as plain text', () => {
    const blocks = parseQuestionText('Broken ```js\nconst answer = 42')
    expect(blocks).toEqual([{ type: 'text', content: 'Broken ```js\nconst answer = 42' }])
    expect(() => render(<QuestionText text="Broken ```js\nconst answer = 42" />)).not.toThrow()
  })
})

describe('QuestionText', () => {
  it('renders paragraphs and inline code', () => {
    render(<QuestionText text={'Use `runs-on: [gpu]` here.\n\nSecond paragraph.'} />)
    expect(screen.getByText('runs-on: [gpu]')).toHaveClass('inline-code')
    expect(screen.getByText('Second paragraph.')).toBeInTheDocument()
  })

  it('renders a fenced block as preformatted code with its language', () => {
    render(<QuestionText text={'Inspect:\n\n```json\n{"key": "value"}\n```'} />)
    expect(screen.getByText('json')).toHaveClass('code-block-language')
    const code = screen.getByText('{"key": "value"}')
    expect(code).toHaveClass('code-line-content')
    expect(code.closest('pre')).not.toBeNull()
  })

  it('renders line numbers when requested', () => {
    render(<QuestionText text={'```yaml linenums\na: 1\nb: 2\n```'} />)
    expect(screen.getByText('1')).toHaveClass('code-line-number')
    expect(screen.getByText('2')).toHaveClass('code-line-number')
    expect(screen.getByText('a: 1')).toHaveClass('code-line-content')
  })

  it('renders multiple inline code spans in one paragraph', () => {
    render(<QuestionText text={'Use `a` and `b` here.'} />)
    const codeSpans = screen.getAllByText(/^[ab]$/)
    expect(codeSpans).toHaveLength(2)
    for (const span of codeSpans) {
      expect(span).toHaveClass('inline-code')
    }
    expect(screen.getByText(/here\./)).toBeInTheDocument()
  })

  it('does not interpret backticks inside a code block', () => {
    render(<QuestionText text={'```md\nUse `code` here\n```'} />)
    expect(screen.getByText('Use `code` here')).toHaveClass('code-line-content')
    expect(screen.queryByText('code')).not.toBeInTheDocument()
  })

  it('preserves code indentation', () => {
    render(<QuestionText text={'```yaml\nroot:\n  child: true\n```'} />)
    expect(screen.getByText('child: true').textContent).toBe('  child: true')
  })
})


describe('multipleAnswerHint', () => {
  it('uses the singular form for one correct option', () => {
    expect(multipleAnswerHint(1)).toBe('Select the one correct option.')
  })

  it('falls back to digits above ten', () => {
    expect(multipleAnswerHint(12)).toBe('Select the 12 correct options.')
  })
})
