import type { Circle, Overlap } from '../types/types'
import { convertIdListToNameList } from '../utils/idToNameUtils'

export const getAllSelectablePieces = (circles: Circle[], overlaps: Overlap[]) => {
  const circleIds = circles.map(circle => circle.id)
  const overlapIdList = overlaps.map(overlap => overlap.circles.map(circle => circle.id))
  const selectablePieces = convertIdListToNameList(circleIds).flat().map(name => [name])

  overlapIdList.forEach(overlapIds => {
    selectablePieces.push(convertIdListToNameList(overlapIds))
  })

  selectablePieces.push(['S'])
  return selectablePieces
}
