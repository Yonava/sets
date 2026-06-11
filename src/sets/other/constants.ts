
export const COLORS = {
  HIGHLIGHT: '#d90429',
  BACKGROUND: 'rgb(55, 65, 81)', // bg-gray-700 tailwind
  CIRCLE_OUTLINE: '#8d99ae',
  CIRCLE_FOCUSED: '#edf2f4',
}

export const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

export const KEY_TO_LATEX = {
    i: "\\cap",
    u: "\\cup",
    d: "\\triangle",
    o: "\\Omega",
    S: "S",
    c: "^\\complement",
    '\\': '\\setminus'
  }as const

  export const LATEX_SET_OPERATIONS = {
    SET_MINUS: 'SetMinus',
    UNION: 'Union',
    INTERSECTION: 'Intersection',
    SYMMETRIC_DIFFERENCE: 'SymmetricDifference',
    COMPLEMENT: 'Complement'
  }

  export type LatexSetOperation = typeof LATEX_SET_OPERATIONS[keyof typeof LATEX_SET_OPERATIONS]
