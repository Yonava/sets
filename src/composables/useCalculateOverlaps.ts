import { generateId } from '@/components/extras'
import type { Overlap, Circle } from '../types/types'
import { ref } from 'vue'

const isOverlapping = (circle1: Circle, circle2: Circle) => {
  const dx = circle2.x - circle1.x
  const dy = circle2.y - circle1.y
  const distance = Math.sqrt(dx * dx + dy * dy)
  return distance < circle1.radius + circle2.radius
}

export const useCalculateOverlaps = (circles: Circle[]) => {
  const overlaps = ref<Overlap[]>([])

  const findOverlaps = (overlapGroup: Circle[], startIndex: number) => {
    if (overlapGroup.length > 1) {
      const color = 'rgba(0, 0, 0, 1)'
      overlaps.value.push({
        circles: [...overlapGroup],
        color,
        originalColor: color,
        id: generateId()
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
        findOverlaps(overlapGroup, i + 1)
        overlapGroup.pop()
      }
    }
  }

  return {
    overlaps,
    findOverlaps,
  }
}