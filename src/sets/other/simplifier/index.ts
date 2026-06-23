import type { MathJsonExpression } from '@cortex-js/compute-engine'
import { parseMathJSON } from '../parseMathJSON'
import { extractVariables, getTruthTable, getOneMinterms } from './truthTable'
import { minimizeDNF } from './quine-mccluskey'
import { dnfToMathJson, mathJsonToLatex } from './dnf'
import { RESERVED_LABELS } from '../constants'

const MAX_VARIABLES = 8
const ALWAYS_ABSENT = new Set<string>(RESERVED_LABELS)

const normalize = (s: string) => s.replace(/\s/g, '')

export const trySimplify = (
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

export const simplifyOnce = (
  latex: string, 
  definedSets?: string[]
): string | null => {
  const expr = parseMathJSON(latex)
  if (!expr) return null

  const node = expr.json as MathJsonExpression
  const allVariables = extractVariables(node)

  if (allVariables.length === 0 || allVariables.length > MAX_VARIABLES) return null

  // Pass 1: algebraic simplification — all variables treated as potentially non-empty
  const algebraic = trySimplify(node, allVariables, latex)
  if (algebraic) return algebraic

  // Pass 2: context simplification — S is always absent (never a circle), and any variable
  // not on the canvas is also treated as empty when canvas circles are defined.
  const contextVars = allVariables.filter(v => {
    if (ALWAYS_ABSENT.has(v)) return false
    if (definedSets && definedSets.length > 0) return definedSets.includes(v)
    return true
  })

  if (contextVars.length > 0 && contextVars.length < allVariables.length) {
    return trySimplify(node, contextVars, latex)
  }

  return null
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

  return result
}
