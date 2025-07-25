import type { Circle, Overlap } from "@/types/types"
import { computed, type Ref } from "vue"

/**
 * all individual sections of the set space
 */
export const useAllSections = (circles: Ref<Circle[]>, overlaps: Ref<Overlap[]>) => {
  return computed(() => {
    const overlapsWithNames = overlaps.value.map(o => o.circles)
    const circlesByThemselves = circles.value.map(c => c.label).map(id => [id])

    return [
      ...overlapsWithNames,
      ...circlesByThemselves,
      ['S'],
    ]
  })
}