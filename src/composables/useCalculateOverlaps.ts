import type { Overlap, Circle } from '../types/types'
import { computed, type Ref } from 'vue'
import { isOverlapping } from '@/utils/sets/circleUtils'
import { COLORS } from '@/utils/sets/constants'

const getOverlapsArray = (circles: Circle[]) => {
  const overlaps: Overlap[] = []
  let overlapId = 1

  const populateOverlaps = (overlapGroup: Circle[] = [], startIndex = 0) => {
    if (overlapGroup.length > 1) {
      overlaps.push({
        circles: overlapGroup.map((c) => c.label),
        color: COLORS.BACKGROUND,
        id: overlapId++,
      })
    }

    for (let i = startIndex; i < circles.length; i++) {
      let allOverlap = true
      for (let j = 0; j < overlapGroup.length; j++) {
        if (!isOverlapping(overlapGroup[j], circles[i])) {
          allOverlap = false
          break
        }
      }

      if (allOverlap) {
        overlapGroup.push(circles[i])
        populateOverlaps(overlapGroup, i + 1)
        overlapGroup.pop()
      }
    }
  }

  populateOverlaps()
  return overlaps
}

export const useOverlaps = (circles: Ref<Circle[]>) => computed(() => {
  return getOverlapsArray(circles.value)
})