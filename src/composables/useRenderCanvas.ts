import { ref, type Ref } from 'vue'
import type { Overlap, Circle, CircleDisplayName } from '@/types/types'
import { isOverlapping } from '@/utils/circleUtils'
import { highlightColor, backgroundColor, circleOutlineColor, showCircleOutlines, showCircleText } from '../utils/constants'
import { generateId } from '@/components/extras'

export const useRenderCanvas = (
  canvas: Ref<HTMLCanvasElement | undefined>,
  circles: Circle[],
) => {
  const overlaps = ref<Overlap[]>([])

  const drawCircleBackground = (ctx: CanvasRenderingContext2D, circle: Circle) => {
    ctx.beginPath()
    ctx.arc(circle.x, circle.y, circle.radius, 0, 2 * Math.PI, false)
    ctx.fillStyle = circle.color
    ctx.fill()
  }

  const drawCircleOutline = (ctx: CanvasRenderingContext2D, circle: Circle) => {
    ctx.beginPath()
    ctx.arc(circle.x, circle.y, circle.radius, 0, 2 * Math.PI, false)
    ctx.lineWidth = 3
    ctx.strokeStyle = circleOutlineColor
    ctx.stroke()
  }

  const drawCircleName = (ctx: CanvasRenderingContext2D, circle: Circle) => {
    ctx.font = '15px Arial'
    ctx.fillStyle = circleOutlineColor
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle'
    ctx.fillText(circle.id, circle.x, circle.y)
    ctx.stroke()
  }

  const drawCircles = (selectedSections: CircleDisplayName[][]) => {
    if (!canvas.value) return
    const ctx = canvas.value.getContext('2d')!
    ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)
    circles.forEach(circle => drawCircleBackground(ctx, circle))
    highlightOverlappingAreas(ctx, selectedSections)
    circles.forEach(circle => {
      if (showCircleOutlines) drawCircleOutline(ctx, circle)
      if (showCircleText) drawCircleName(ctx, circle)
    })
  }

  const drawOverlappingAreas = (ctx: CanvasRenderingContext2D, overlap: Overlap) => {
    if (!canvas.value) return
    ctx.save()
    overlap.circles.forEach(c => {
      ctx.beginPath()
      ctx.arc(c.x, c.y, c.radius, 0, 2 * Math.PI)
      ctx.clip()
    })

    ctx.fillStyle = overlap.color
    ctx.fillRect(0, 0, canvas.value.width, canvas.value.height)
    ctx.restore()
  }


  const renderSelectedSections = (highlightIds: CircleDisplayName[][]) => {
    circles.forEach(circle => circle.color = backgroundColor)

    highlightIds.forEach(ids => {
      if (ids.length === 1) {
        const id = ids[0]
        circles.forEach(circle => {
          if (circle.id === id) {
            circle.color = highlightColor
          }
        })
      } else {
        overlaps.value.forEach(overlap => {
          const overlapIds = overlap.circles.map(circle => circle.id).sort((a, b) => a.localeCompare(b))
          const sortedIds = [...ids].sort((a, b) => a.localeCompare(b))
          if (JSON.stringify(overlapIds) === JSON.stringify(sortedIds)) {
            overlap.color = highlightColor
          }
        })
      }
    })
  }

  const populateOverlapsArray = (overlapGroup: Circle[] = [], startIndex = 0) => {
    if (overlapGroup.length > 1) {
      const color = backgroundColor
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
        populateOverlapsArray(overlapGroup, i + 1)
        overlapGroup.pop()
      }
    }
  }

  const highlightOverlappingAreas = (
    ctx: CanvasRenderingContext2D,
    selectedSections: CircleDisplayName[][]
  ) => {
    overlaps.value = []
    populateOverlapsArray()
    // IMPORTANT for render order
    overlaps.value.sort((a, b) => a.circles.length - b.circles.length)
    /*
      IMPORTANT thing here is that if you want regions that exclude others, render order matters. if you want
      something union with something but excluding something else, then put it behind those and have the stuff render on top of it.
    */
    renderSelectedSections(selectedSections) // IMPORTANT has to be after overlaps get generated
    overlaps.value.forEach(o => drawOverlappingAreas(ctx, o))
  }

  return {
    drawCircles,
    overlaps,
  }
}