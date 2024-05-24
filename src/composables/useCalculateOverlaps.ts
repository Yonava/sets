import type { Overlap, Circle } from '../types/types'
import { ref, reactive } from 'vue'

const useCalculateOverlaps = (circles: Circle[] ) => {

  const currentOverlapId = ref(0)
  const overlaps = reactive<Overlap[]>([])

  const isOverlapping = (circle1: Circle, circle2: Circle) => {
    const dx = circle2.x - circle1.x
    const dy = circle2.y - circle1.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    return distance < circle1.radius + circle2.radius
  }

  const findOverlaps = (overlapGroup: Circle[], startIndex: number) => {
    if (overlapGroup.length > 1) {
      const color = 'rgba(0, 0, 0, 1)'
      overlaps.push({
        circles: [...overlapGroup],
        color,
        originalColor: color,
        id: currentOverlapId.value
      })
      currentOverlapId.value++
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
        findOverlaps(overlapGroup, i + 1)
        overlapGroup.pop()
      }
    }
  }

  return {
    currentOverlapId,
    overlaps,

    findOverlaps,
  }
}

export default useCalculateOverlaps