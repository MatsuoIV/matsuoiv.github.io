import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

interface BankQuestion {
  id: string
  text: string
  options: { id: string }[]
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
