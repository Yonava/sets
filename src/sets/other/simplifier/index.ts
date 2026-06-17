import type { MathJsonExpression } from '@cortex-js/compute-engine'
import { parseMathJSON } from '../parseMathJSON'
import { extractVariables, getTruthTable, getOneMinterms } from './truthTable'
import { minimizeDNF } from './quine-mccluskey'
import { dnfToMathJson, mathJsonToLatex, countNodes } from './dnf'

const MAX_VARIABLES = 8

export function simplify(latex: string): string | null {
  const expr = parseMathJSON(latex)
  if (!expr) return null

  const node = expr.json as MathJsonExpression
  const variables = extractVariables(node)

  if (variables.length === 0 || variables.length > MAX_VARIABLES) return null

  const truthTable = getTruthTable(node, variables)
  const ones = getOneMinterms(truthTable, variables.length)

  // Empty set or full partition — skip, no useful simplification to show
  if (ones.length === 0 || ones.length === 2 ** variables.length) return null

  const terms = minimizeDNF(ones, variables)
  const simplified = dnfToMathJson(terms)

  // Safety check: verify the simplified form is semantically equivalent
  if (getTruthTable(simplified, variables) !== truthTable) return null

  // Only suggest if strictly fewer nodes than the original
  if (countNodes(simplified) >= countNodes(node)) return null

  return mathJsonToLatex(simplified)
}
