import type { Ref } from 'vue'
import type { Overlap, Circle } from '@/types/types'
import { isOverlapping } from '@/utils/circleUtils'
import { convertFromIdToName } from '@/utils/idToNameUtils'
import { highlightColor, backgroundColor, circleSelectedColor, circleOutlineColor } from '../utils/constants'


const useRenderCanvas = (
  canvas: Ref<HTMLCanvasElement | null>,
  circles: Circle[], overlaps: Overlap[],
  currentOverlapId: Ref<number>,
  selectedOverlap: Ref<Overlap | null>,
) => {

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
    ctx.strokeStyle = circle.selected ? circleSelectedColor : circleOutlineColor
    ctx.stroke()
  }

  const drawCircleName = (ctx: CanvasRenderingContext2D, circle: Circle) => {
    ctx.font = '15px Arial'
    ctx.fillStyle = circle.selected ? circleSelectedColor : circleOutlineColor
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle'
    ctx.fillText(convertFromIdToName(circle.id), circle.x, circle.y)
    ctx.stroke()
  }

  const drawCircles = (selectedSections: number[][]) => {
    if (!canvas.value) return
    const ctx = canvas.value.getContext('2d')!
    ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)
    circles.forEach(circle => drawCircleBackground(ctx, circle))
    highlightOverlappingAreas(ctx, selectedSections)
    circles.forEach(circle => {
      drawCircleOutline(ctx, circle)
      drawCircleName(ctx, circle)
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


  const renderSelectedSections = (highlightIds: number[][]) => {
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
        overlaps.forEach(overlap => {
          const overlapIds = overlap.circles.map(circle => circle.id).sort((a, b) => a - b)
          const sortedIds = [...ids].sort((a, b) => a - b)
          if (JSON.stringify(overlapIds) === JSON.stringify(sortedIds)) {
            overlap.color = highlightColor
          }
        })
      }
    })
  }

  const findOverlaps = (overlapGroup: Circle[], startIndex: number) => {
    if (overlapGroup.length > 1) {
      const color = backgroundColor
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

  const highlightOverlappingAreas = (ctx: CanvasRenderingContext2D, selectedSections: number[][]) => {
    overlaps.length = 0
    currentOverlapId.value = 0

    findOverlaps([], 0)
    // IMPORTANT for render order
    overlaps.sort((a, b) => a.circles.length - b.circles.length)
    if (selectedOverlap.value) overlaps.push(selectedOverlap.value)
    /*
      IMPORTANT thing here is that if you want regions that exclude others, render order matters. if you want
      something union with something but excluding something else, then put it behind those and have the stuff render on top of it.
    */
    renderSelectedSections(selectedSections) // IMPORTANT has to be after overlaps get generated
    overlaps.forEach(o => drawOverlappingAreas(ctx, o))
  }

  return {
    drawCircles,
  }
}

export default useRenderCanvas