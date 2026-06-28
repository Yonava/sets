export type DNFTerm = {
  positive: Set<string>
  negative: Set<string>
}

type Implicant = { value: number; mask: number }

const canCombine = (a: Implicant, b: Implicant): boolean => {
  if (a.mask !== b.mask) return false
  const diff = a.value ^ b.value
  return diff !== 0 && (diff & (diff - 1)) === 0
}

const combine = (a: Implicant, b: Implicant): Implicant => {
  const diff = a.value ^ b.value
  return { value: a.value & b.value, mask: a.mask | diff }
}

const covers = (imp: Implicant, minterm: number): boolean => {
  return (minterm & ~imp.mask) === (imp.value & ~imp.mask)
}

const getPrimeImplicants = (ones: number[]): Implicant[] => {
  const primes: Implicant[] = []
  let current: Implicant[] = ones.map(v => ({ value: v, mask: 0 }))

  while (current.length > 0) {
    const used = new Set<number>()
    const nextMap = new Map<string, Implicant>()

    for (let i = 0; i < current.length; i++) {
      for (let j = i + 1; j < current.length; j++) {
        if (canCombine(current[i], current[j])) {
          const merged = combine(current[i], current[j])
          nextMap.set(`${merged.value},${merged.mask}`, merged)
          used.add(i)
          used.add(j)
        }
      }
    }

    current.forEach((imp, i) => { if (!used.has(i)) primes.push(imp) })
    current = [...nextMap.values()]
  }

  return primes
}

const selectCover = (primes: Implicant[], ones: number[]): Implicant[] => {
  const uncovered = new Set(ones)
  const selected: Implicant[] = []
  const selectedKeys = new Set<string>()

  const key = (imp: Implicant) => `${imp.value},${imp.mask}`

  const add = (imp: Implicant) => {
    if (selectedKeys.has(key(imp))) return
    selectedKeys.add(key(imp))
    selected.push(imp)
    for (const m of ones) { if (covers(imp, m)) uncovered.delete(m) }
  }

  // Essential prime implicants: minterms covered by exactly one prime
  for (const m of ones) {
    const covering = primes.filter(p => covers(p, m))
    if (covering.length === 1) add(covering[0])
  }

  // Greedy cover for any remaining uncovered minterms
  while (uncovered.size > 0) {
    let best: Implicant | null = null
    let bestCount = 0
    for (const p of primes) {
      if (selectedKeys.has(key(p))) continue
      const count = [...uncovered].filter(m => covers(p, m)).length
      if (count > bestCount) { bestCount = count; best = p }
    }
    if (!best) break
    add(best)
  }

  return selected
}

const implicantToDNFTerm = (imp: Implicant, variables: string[]): DNFTerm => {
  const positive = new Set<string>()
  const negative = new Set<string>()
  for (let j = 0; j < variables.length; j++) {
    if ((imp.mask >> j) & 1) continue
    if ((imp.value >> j) & 1) positive.add(variables[j])
    else negative.add(variables[j])
  }
  return { positive, negative }
}

export const minimizeDNF = (ones: number[], variables: string[]): DNFTerm[] => {
  if (ones.length === 0) return []
  if (ones.length === 2 ** variables.length) {
    return [{ positive: new Set(), negative: new Set() }]
  }
  const primes = getPrimeImplicants(ones)
  const cover = selectCover(primes, ones)
  return cover.map(imp => implicantToDNFTerm(imp, variables))
}
