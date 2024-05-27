import { type Ref, unref } from 'vue'

const alphabet = 'abcdefghijklmnpqrtuvwxyz' // reserved keys: 'S'; 'O'

export const convertFromNameToId = (circleName: string | Ref<string>) => {
  const name = unref(circleName).toLocaleLowerCase()
  const base = alphabet.length

  let id = 0
  for (let i = 0; i < name.length; i++) {
    id = id * base + (alphabet.indexOf(name[i]) + 1)
  }
  return id
}

export const convertNameListToIdList = (nameList: string[][] | Ref<string[][]>) => {
  const list = unref(nameList)
  return list.map(names => names.map(name => convertFromNameToId(name)))
}

export const convertFromIdToName = (circleId: number | Ref<number>) => {
  const id = unref(circleId)
  const base = alphabet.length

  let result = ''
  let currentId = id

  while (currentId > 0) {
    currentId--
    result = alphabet[currentId % base] + result
    currentId = Math.floor(currentId / base)
  }

  return result.toLocaleUpperCase()
}

export const convertIdListToNameList = (idList: number[] | Ref<number[]>) => {
  const list = unref(idList)
  return list.map(id => convertFromIdToName(id))
}
