import type { Circle, Overlap } from '../types/types'
import { convertIdListToNameList } from '../utils/idToNameUtils'

const useGetAllSelectablePieces = () => {
  let prevCirclesLength: number = 0
  let prevOverlaps: Overlap[] = []
  let memoizedResult: string[][] | null = null

  return (circles: Circle[], overlaps: Overlap[]) => {
    const circlesLength = circles.length
    const overlapsChanged = JSON.stringify(overlaps) !== JSON.stringify(prevOverlaps)

    if (circlesLength === prevCirclesLength && !overlapsChanged && memoizedResult) {
      return memoizedResult
    }

    prevCirclesLength = circlesLength
    prevOverlaps = [...overlaps]

    const circleIds = circles.map(circle => circle.id)
    const overlapIdList = overlaps.map(overlap => overlap.circles.map(circle => circle.id))
    const selectablePieces = convertIdListToNameList(circleIds).flat().map(name => [name])

    overlapIdList.forEach(overlapIds => {
      selectablePieces.push(convertIdListToNameList(overlapIds))
    })

    selectablePieces.push(['S'])

    memoizedResult = selectablePieces
    return selectablePieces
  }
}

export default useGetAllSelectablePieces
