import type { MathJsonExpression } from '@cortex-js/compute-engine'
import { parseMathJSON } from '../parseMathJSON'
import { extractVariables, getTruthTable, getOneMinterms } from './truthTable'
import { minimizeDNF } from './quine-mccluskey'
import { dnfToMathJson, mathJsonToLatex } from './dnf'
import { RESERVED_LABELS, LATEX_SET_SYMBOLS } from '../constants'

const MAX_VARIABLES = 8
const MAX_SIMPLIFICATION_ITERATIONS = 10
const RESERVED = new Set<string>(RESERVED_LABELS)
const OPERATOR_WEIGHTS = {
  '\\cup': 1,
  '\\cap': 1,
  '^{\\complement}': 1,
  '\\setminus': 2,
  '\\triangle': 3,
} as const

const normalize = (s: string) => s.replace(/\s/g, '')

const stripDoubleComplement = (node: MathJsonExpression): MathJsonExpression => {
  if (!Array.isArray(node)) return node

  const [head, ...args] = node

  if (
    head === LATEX_SET_SYMBOLS.COMPLEMENT &&
    Array.isArray(args[0]) &&
    args[0][0] === LATEX_SET_SYMBOLS.COMPLEMENT
  ) {
    return stripDoubleComplement(args[0][1] as MathJsonExpression)
  }

  return [head, ...args.map(stripDoubleComplement)] as MathJsonExpression
}

const countOperatorWeight = (latex: string): number => {
  const s = normalize(latex)
  return Object.entries(OPERATOR_WEIGHTS).reduce((total, [op, weight]) => (
    total + (s.split(op).length - 1) * weight
  ), 0)
}

const trySimplify = (
  node: MathJsonExpression,
  variables: string[],
  originalLatex: string
): string | null => {
  const truthTable = getTruthTable(node, variables)
  const ones = getOneMinterms(truthTable, variables.length)

  if (ones.length === 0 || ones.length === 2 ** variables.length) return null

  const terms = minimizeDNF(ones, variables)
  const simplified = dnfToMathJson(terms)

  if (getTruthTable(simplified, variables) !== truthTable) return null

  const result = mathJsonToLatex(simplified)
  if (normalize(result) === normalize(originalLatex)) return null

  return result
}

const simplifyOnce = (
  latex: string,
  definedSets?: string[]
): string | null => {
  const expr = parseMathJSON(latex)
  if (!expr) return null

  const node = expr.json 

  const canvasVars = definedSets?.filter(v => !RESERVED.has(v)).sort()
  const variables = (canvasVars && canvasVars.length > 0)
    ? canvasVars
    : extractVariables(node)

  if (variables.length === 0 || variables.length > MAX_VARIABLES) return null

  return trySimplify(node, variables, latex)
}

export const simplify = (
  latex: string,
  definedSets?: string[]
): string | null => {
  const expr = parseMathJSON(latex)
  const stripped = expr ? mathJsonToLatex(stripDoubleComplement(expr.json)) : null
  const baseLatex = stripped && normalize(stripped) !== normalize(latex) ? stripped : latex

  const originalWeight = countOperatorWeight(latex)

  let current = baseLatex
  let best: string | null = baseLatex !== latex ? baseLatex : null
  let bestWeight = best ? countOperatorWeight(best) : originalWeight

  for (let i = 0; i < MAX_SIMPLIFICATION_ITERATIONS; i++) {
    const next = simplifyOnce(current, definedSets)
    if (!next) break
    current = next

    const weight = countOperatorWeight(next)
    if (weight < bestWeight) {
      best = next
      bestWeight = weight
    }
  }

  if (!best || bestWeight >= originalWeight) return null

  return best
}
