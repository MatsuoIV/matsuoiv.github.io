import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

interface BankQuestion {
  id: string
  text: string
  options: { id: string; rationale?: string }[]
  correctAnswers: string[]
}

interface Bank {
  title: string
  questions: BankQuestion[]
}

const dataDir = join(process.cwd(), 'public', 'data')
const banks = readdirSync(dataDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .filter((name) => {
    try {
      readFileSync(join(dataDir, name, 'questions.json'))
      return true
    } catch {
      return false
    }
  })

describe('question banks', () => {
  it('finds at least one bank', () => {
    expect(banks.length).toBeGreaterThan(0)
  })

  for (const bank of banks) {
    it(`${bank}: question ids are unique and answers reference existing options`, () => {
      const data = JSON.parse(
        readFileSync(join(dataDir, bank, 'questions.json'), 'utf8')
      ) as Bank

      const ids = data.questions.map((question) => question.id)
      expect(new Set(ids).size).toBe(ids.length)

      for (const question of data.questions) {
        const optionIds = new Set(question.options.map((option) => option.id))
        expect(question.correctAnswers.length).toBeGreaterThan(0)
        for (const answer of question.correctAnswers) {
          expect(optionIds.has(answer)).toBe(true)
        }
        expect(question.correctAnswers.length).toBeLessThanOrEqual(question.options.length)
      }
    })

    it(`${bank}: every option has a rationale`, () => {
      const data = JSON.parse(
        readFileSync(join(dataDir, bank, 'questions.json'), 'utf8')
      ) as Bank

      const missing: string[] = []
      for (const question of data.questions) {
        for (const option of question.options) {
          if (!option.rationale || option.rationale.trim().length === 0) {
            missing.push(`${question.id}.${option.id}`)
          }
        }
      }
      expect(missing, `missing rationales in ${bank}`).toEqual([])
    })

    it(`${bank}: code fences are balanced`, () => {
      const data = JSON.parse(
        readFileSync(join(dataDir, bank, 'questions.json'), 'utf8')
      ) as Bank

      for (const question of data.questions) {
        const fences = question.text.match(/```/g) ?? []
        expect(fences.length % 2, `unbalanced fence in ${bank}/${question.id}`).toBe(0)
      }
    })
  }
})

describe('gh-200 audited answer keys', () => {
  const expected: Record<string, string[]> = {
    q1: ['a'],
    q2: ['e'],
    q9: ['e'],
    q11: ['a'],
    q13: ['f'],
    q17: ['a'],
    q18: ['d'],
    q19: ['b'],
    q20: ['c'],
    q21: ['d'],
    q30: ['a'],
    q31: ['a', 'e'],
    q34: ['a'],
    q39: ['e'],
    q40: ['c'],
    q50: ['c'],
    q56: ['a'],
    q66: ['a'],
    q67: ['e'],
    q69: ['b', 'd'],
    q75: ['c'],
    q77: ['c'],
    q80: ['b'],
    q85: ['a'],
  }

  it('keeps the verified key for questions the source bank had wrong', () => {
    const data = JSON.parse(
      readFileSync(join(dataDir, 'gh-200', 'questions.json'), 'utf8')
    ) as Bank
    const actual = new Map(data.questions.map((question) => [question.id, question.correctAnswers]))

    for (const [id, answers] of Object.entries(expected)) {
      expect(actual.get(id), `answer key for ${id}`).toEqual(answers)
    }
  })
})
