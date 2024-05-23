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
  return removingWhitespace.split('').filter((char) => char !== '\\')
}

const setParser = (partition: Subset[]) => {

  const getSet = (set: string) => {
    return partition.filter((subset) => subset.includes(set))
  }

  const isEqual = (set1: Subset[], set2: Subset[]) => {
    const s1Str = set1.sort().join('')
    const s2Str = set2.sort().join('')
    return s1Str === s2Str
  }

  const union = (set1: Subset[], set2: Subset[]) => {
    return set1.concat(set2)
  }

  const intersection = (set1: Subset[], set2: Subset[]) => {
    return set1.filter((element) => set2.includes(element))
  }

  const difference = (set1: Subset[], set2: Subset[]) => {
    return set1.filter((element) => !set2.includes(element))
  }

  const exclusion = (set1: Subset[], set2: Subset[]) => {
    return union(difference(set1, set2), difference(set2, set1))
  }

  const parse = (expression: string[]) => {
    // const stack: string[] = []
    const [left, mid, right] = expression

  }

  return parse
}

export { setLatexToExpression, setParser }