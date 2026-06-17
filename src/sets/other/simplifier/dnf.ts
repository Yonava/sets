import type { MathJsonExpression } from '@cortex-js/compute-engine'
import type { DNFTerm } from './quine-mccluskey'
import { LATEX_SET_SYMBOLS as S } from '../constants'

function setsEqual(a: Set<string>, b: Set<string>): boolean {
  if (a.size !== b.size) return false
  return [...a].every(x => b.has(x))
}

function foldBinary(op: string, items: MathJsonExpression[]): MathJsonExpression {
  if (items.length === 1) return items[0]
  return [op, items[0], foldBinary(op, items.slice(1))]
}

// (A ∩ B^c) ∪ (A^c ∩ B)  →  A △ B
function matchSymmetricDiff(terms: DNFTerm[]): MathJsonExpression | null {
  if (terms.length !== 2) return null
  const [t1, t2] = terms
  if (t1.positive.size !== 1 || t1.negative.size !== 1) return null
  if (setsEqual(t1.positive, t2.negative) && setsEqual(t1.negative, t2.positive)) {
    const [a] = t1.positive
    const [b] = t1.negative
    return [S.SYMMETRIC_DIFFERENCE, a, b]
  }
  return null
}

// (A ∩ B) ∪ (A^c ∩ B^c)  →  (A △ B)^c
function matchComplementSymmetricDiff(terms: DNFTerm[]): MathJsonExpression | null {
  if (terms.length !== 2) return null
  const [t1, t2] = terms
  const allPos = (t: DNFTerm) => t.negative.size === 0 && t.positive.size === 2
  const allNeg = (t: DNFTerm) => t.positive.size === 0 && t.negative.size === 2
  if (!((allPos(t1) && allNeg(t2)) || (allNeg(t1) && allPos(t2)))) return null
  const posTerm = allPos(t1) ? t1 : t2
  const negTerm = allNeg(t1) ? t1 : t2
  if (!setsEqual(posTerm.positive, negTerm.negative)) return null
  const [a, b] = [...posTerm.positive]
  return [S.COMPLEMENT, [S.SYMMETRIC_DIFFERENCE, a, b]]
}

function termToMathJson(term: DNFTerm): MathJsonExpression {
  const { positive, negative } = term

  // A \ B
  if (positive.size === 1 && negative.size === 1) {
    const [a] = positive
    const [b] = negative
    return [S.SET_MINUS, a, b]
  }

  // (A ∪ B ∪ ...)^c  — single term with only negated variables
  if (positive.size === 0 && negative.size > 0) {
    return [S.COMPLEMENT, foldBinary(S.UNION, [...negative])]
  }

  // General intersection of literals
  const literals: MathJsonExpression[] = [
    ...[...positive],
    ...[...negative].map(v => [S.COMPLEMENT, v] as MathJsonExpression),
  ]
  return foldBinary(S.INTERSECTION, literals)
}

export function dnfToMathJson(terms: DNFTerm[]): MathJsonExpression {
  const symDiff = matchSymmetricDiff(terms)
  if (symDiff) return symDiff

  const compSymDiff = matchComplementSymmetricDiff(terms)
  if (compSymDiff) return compSymDiff

  return foldBinary(S.UNION, terms.map(termToMathJson))
}

export function mathJsonToLatex(node: MathJsonExpression): string {
  if (typeof node === 'string') return node
  if (!Array.isArray(node)) return ''
  const [head, ...args] = node as [string, ...MathJsonExpression[]]

  // Wrap binary operations in parens when used as arguments
  const wrap = (child: MathJsonExpression): string => {
    if (typeof child === 'string') return child
    if (!Array.isArray(child)) return ''
    const isBinary = child[0] !== S.COMPLEMENT
    const inner = mathJsonToLatex(child)
    return isBinary ? `\\left(${inner}\\right)` : inner
  }

  switch (head) {
    case S.UNION:                return `${wrap(args[0])} \\cup ${wrap(args[1])}`
    case S.INTERSECTION:         return `${wrap(args[0])} \\cap ${wrap(args[1])}`
    case S.SET_MINUS:            return `${wrap(args[0])} \\setminus ${wrap(args[1])}`
    case S.SYMMETRIC_DIFFERENCE: return `${wrap(args[0])} \\triangle ${wrap(args[1])}`
    case S.COMPLEMENT:           return `${wrap(args[0])}^{\\complement}`
    default:                     return String(node)
  }
}

export function countNodes(node: MathJsonExpression): number {
  if (typeof node === 'string') return 1
  if (!Array.isArray(node)) return 1
  const [, ...args] = node as [string, ...MathJsonExpression[]]
  return 1 + args.reduce((sum, arg) => sum + countNodes(arg), 0)
}
