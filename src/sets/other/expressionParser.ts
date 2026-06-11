import type { MathJsonExpression } from '@cortex-js/compute-engine'

// [a] => a excluding all other sets
// [a, b] => a intersection b excluding all other sets
// [a, b, c] => a intersection b intersection c excluding all other sets
type Subset = string[]

const setParser = (partition: Subset[]) => {
  const getSet = (set: string) => {
    if (set === 'Omega') return partition
    return partition.filter((subset) => subset.includes(set))
  }

  const isEqual = (set1: Subset, set2: Subset) => {
    return set1.length === set2.length && set1.every((element) => set2.includes(element))
  }

  const union = (set1: Subset[], set2: Subset[]) => set1.concat(set2)

  const intersection = (set1: Subset[], set2: Subset[]) =>
    set1.filter((element) => set2.includes(element))

  const exclusion = (set1: Subset[], set2: Subset[]) =>
    set1.filter((element) => !set2.includes(element))

  const difference = (set1: Subset[], set2: Subset[]) =>
    exclusion(union(set1, set2), intersection(set1, set2))

  const complement = (set: Subset[]) =>
    partition.filter((subset) => set.every((element) => !isEqual(subset, element)))

  const dedupe = (sets: Subset[]) =>
    sets.filter((set, index) => sets.findIndex((other) => isEqual(set, other)) === index)

  const parseHelper = (node: MathJsonExpression): Subset[] => {
    if (typeof node === 'string') {
      return getSet(node)
    }

    if (!Array.isArray(node) || node.length < 2 || typeof node[0] !== 'string') {
      throw new Error('Invalid MathJSON expression')
    }

    const [head, ...args] = node as [string, ...MathJsonExpression[]]

    switch (head) {
      case 'Union':
        return union(parseHelper(args[0]), parseHelper(args[1]))
      case 'Intersection':
        return intersection(parseHelper(args[0]), parseHelper(args[1]))
      case 'SymmetricDifference':
        return difference(parseHelper(args[0]), parseHelper(args[1]))
      case 'Complement':
        return complement(parseHelper(args[0]))
      case 'SetMinus':
        return exclusion(parseHelper(args[0]), parseHelper(args[1]))
      default:
        throw new Error(`Unknown operator: ${head}`)
    }
  }

  return (mathJSON: MathJsonExpression) => {
    if (!mathJSON) return []
    return dedupe(parseHelper(mathJSON))
  }
}

export { setParser }
