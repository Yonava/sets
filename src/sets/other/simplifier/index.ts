import type { MathJsonExpression } from '@cortex-js/compute-engine'
import { parseMathJSON } from '../parseMathJSON'
import { extractVariables, getTruthTable, getOneMinterms } from './truthTable'
import { minimizeDNF } from './quine-mccluskey'
import { dnfToMathJson, mathJsonToLatex } from './dnf'
import { RESERVED_LABELS } from '../constants'

const MAX_VARIABLES = 8
const RESERVED = new Set<string>(RESERVED_LABELS)
const OPERATOR_WEIGHTS = {
  '\\cup': 1,
  '\\cap': 1,
  '^{\\complement}': 1,
  '\\setminus': 2,
  '\\triangle': 3,
} as const

const normalize = (s: string) => s.replace(/\s/g, '')

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
  let current = latex
  let result: string | null = null

  for (let i = 0; i < 10; i++) {
    const next = simplifyOnce(current, definedSets)
    if (!next) break
    result = next
    current = next
  }

  if (!result || countOperatorWeight(result) >= countOperatorWeight(latex)) return null

  return result
}
