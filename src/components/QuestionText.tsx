import type { ReactNode } from 'react'
import type { CodeBlock } from '../utils/questionText'
import { parseQuestionText } from '../utils/questionText'

function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = []
  const pattern = /`([^`]+)`/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index))
    }
    nodes.push(
      <code key={`inline-${match.index}`} className="inline-code">
        {match[1]}
      </code>
    )
    lastIndex = pattern.lastIndex
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex))
  }

  return nodes
}

function CodeBlockView({ block }: { block: CodeBlock }) {
  const lines = block.code.split('\n')

  return (
    <figure className="code-block">
      {block.language && (
        <figcaption className="code-block-language">{block.language}</figcaption>
      )}
      <pre className="code-block-pre">
        <code>
          {lines.map((line, index) => (
            <span className="code-line" key={index}>
              {block.lineNumbers && (
                <span className="code-line-number" aria-hidden="true">
                  {index + 1}
                </span>
              )}
              <span className="code-line-content">{line}</span>
            </span>
          ))}
        </code>
      </pre>
    </figure>
  )
}

interface QuestionTextProps {
  text: string
  className?: string
}

/**
 * Renders a question statement with support for fenced code blocks and inline
 * code spans. Used by both the exam view and the result summary.
 */
export function QuestionText({ text, className }: QuestionTextProps) {
  const blocks = parseQuestionText(text)

  return (
    <div className={`question-text${className ? ` ${className}` : ''}`}>
      {blocks.map((block, index) => {
        if (block.type === 'code') {
          return <CodeBlockView key={index} block={block} />
        }

        const paragraphs = block.content.split(/\n{2,}/).filter((p) => p.trim())

        return paragraphs.map((paragraph, paragraphIndex) => (
          <p key={`${index}-${paragraphIndex}`} className="question-text-paragraph">
            {renderInline(paragraph)}
          </p>
        ))
      })}
    </div>
  )
}
