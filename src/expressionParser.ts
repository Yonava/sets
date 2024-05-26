import { expressionToAST, ASTNode, tokenize } from './ast'

// [a] => a excluding all other sets
// [a, b] => a intersection b excluding all other sets
// [a, b, c] => a intersection b intersection c excluding all other sets
type Subset = string[]

// used for swapping commands in latex to single character for parsing
const setLatexAlias: Record<string, string> = {
  'cup': '0',
  'cap': '1',
  'Delta': '2'
}

const setLatexToExpression = (latex: string) => {
  const commandsForMatching = Object.keys(setLatexAlias)
  const commands = commandsForMatching.join('|')
  const regex = new RegExp(commands, 'g')
  const replacingCommands = latex.replace(regex, (match) => {
    return setLatexAlias[match]
  })
  const removingWhitespace = replacingCommands.replace(/\s/g, '')
  return removingWhitespace.split('').filter((char) => char !== '\\').join('')
}

const setParser = (partition: Subset[]) => {

  const getSet = (set: string) => {
    return partition.filter((subset) => subset.includes(set))
  }

  const isEqual = (set1: Subset, set2: Subset) => {
    return set1.length === set2.length && set1.every((element) => set2.includes(element))
  }

  const union = (set1: Subset[], set2: Subset[]) => {
    return set1.concat(set2)
  }

  const intersection = (set1: Subset[], set2: Subset[]) => {
    return set1.filter((element) => set2.includes(element))
  }

  const exclusion = (set1: Subset[], set2: Subset[]) => {
    return set1.filter((element) => !set2.includes(element))
  }

  const difference = (set1: Subset[], set2: Subset[]) => {
    return exclusion(union(set1, set2), intersection(set1, set2))
  }

  const complement = (set: Subset[]) => {
    return partition.filter((subset) => {
      return set.every((element) => !isEqual(subset, element))
    })
  }

  const dedupe = (sets: Subset[]) => {
    return sets.filter((set, index) => {
      return sets.findIndex((otherSet) => isEqual(set, otherSet)) === index
    })
  }

  const parse = (expression: string) => {
    return tokenize(expression)
    if (!expression) return []

    const parseHelper = (node: ASTNode): Subset[] => {
      if (node.token.type === 'OPERAND') {
        return getSet(node.token.value)
      }

      if (!node.left || !node.right) {
        throw new Error('Invalid expression')
      }

      const left = parseHelper(node.left)
      const right = parseHelper(node.right)
      switch (node.token.value) {
        case '0':
          return union(left, right)
        case '1':
          return intersection(left, right)
        case '2':
          return difference(left, right)
        case '/':
          return exclusion(left, right)
        default:
          throw new Error('Invalid operator')
      }
    }

    return dedupe(parseHelper(expressionToAST(expression)))
  }

  return parse
}

export { setLatexToExpression, setParser }