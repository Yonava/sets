

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

  const parse = (expression: string[]) => {
  }

  return parse
}

export { setLatexToExpression, setParser }