import type { MathJsonExpression } from '@cortex-js/compute-engine'
import { setParser } from '../expressionParser'

export function extractVariables(node: MathJsonExpression): string[] {
  if (typeof node === 'string') return /^[A-Z]$/.test(node) ? [node] : []
  if (!Array.isArray(node)) return []
  const [, ...args] = node as [string, ...MathJsonExpression[]]
  return [...new Set(args.flatMap(extractVariables))].sort()
}

// minterm i represents the atom where variable[j] is present iff bit j of i is set
function buildPartition(variables: string[]): string[][] {
  return Array.from({ length: 2 ** variables.length }, (_, i) =>
    variables.filter((_, j) => (i >> j) & 1)
  )
}

export function getTruthTable(node: MathJsonExpression, variables: string[]): number {
  const partition = buildPartition(variables)
  const parse = setParser(partition)
  const result = parse(node)
  if (!result) return 0

  return partition.reduce((mask, atom, i) => {
    const inResult = result.some(r =>
      r.length === atom.length && r.every(v => atom.includes(v))
    )
    return inResult ? mask | (1 << i) : mask
  }, 0)
}

export function getOneMinterms(truthTable: number, variableCount: number): number[] {
  return Array.from({ length: 2 ** variableCount }, (_, i) => i)
    .filter(i => (truthTable >> i) & 1)
}
