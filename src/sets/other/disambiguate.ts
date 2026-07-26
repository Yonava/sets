import { parseMathJSON } from './parseMathJSON'
import { mathJsonToLatex } from './simplifier/dnf'

// Binary set operators with no shared, agreed-upon precedence in this app —
// mixing two different kinds (or repeating \setminus, which isn't associative)
// without explicit grouping means the parser had to make an arbitrary choice.
const BINARY_OPS = ['\\cup', '\\cap', '\\setminus', '\\triangle'] as const
type BinaryOp = typeof BINARY_OPS[number]

const TOKEN_RE = /\\left\(|\\right\)|\(|\)|\\cup|\\cap|\\setminus|\\triangle/g

const isSegmentAmbiguous = (ops: BinaryOp[]): boolean => {
  const distinct = new Set(ops)
  if (distinct.size > 1) return true
  return distinct.has('\\setminus') && ops.length >= 2
}

export const isAmbiguous = (latex: string): boolean => {
  const tokens = latex.match(TOKEN_RE) ?? []
  const stack: BinaryOp[][] = [[]]
  let ambiguous = false

  for (const token of tokens) {
    if (token === '(' || token === '\\left(') {
      stack.push([])
    } else if (token === ')' || token === '\\right)') {
      const segment = stack.length > 1 ? stack.pop()! : stack[0]
      if (isSegmentAmbiguous(segment)) ambiguous = true
    } else {
      stack[stack.length - 1].push(token as BinaryOp)
    }
  }

  while (stack.length > 0) {
    if (isSegmentAmbiguous(stack.pop()!)) ambiguous = true
  }

  return ambiguous
}

// The fully-parenthesized form the parser actually computes, so it can be
// shown to the user when isAmbiguous(latex) is true.
export const getDisambiguatedLatex = (latex: string): string | null => {
  const parsed = parseMathJSON(latex)
  if (!parsed || !parsed.isValid) return null
  return mathJsonToLatex(parsed.json)
}
