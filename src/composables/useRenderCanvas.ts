import type { Overlap, Circle, CircleDisplayName } from '@/types/types'
import { isOverlapping } from '@/utils/circleUtils'
import { highlightColor, backgroundColor, circleOutlineColor, showCircleOutlines, showCircleText } from '../utils/constants'
import { generateId } from '@/components/extras'

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

const drawOverlappingAreas = (ctx: CanvasRenderingContext2D, overlap: Overlap) => {
  ctx.save()
  overlap.circles.forEach(c => {
    ctx.beginPath()
    ctx.arc(c.x, c.y, c.radius, 0, 2 * Math.PI)
    ctx.clip()
  })

  ctx.fillStyle = overlap.color
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  ctx.restore()
}

export const drawCircles = (
  ctx: CanvasRenderingContext2D,
  circles: Circle[],
  selectedSections: CircleDisplayName[][]
) => {
  circles.forEach(circle => drawCircleBackground(ctx, circle))
  highlightOverlappingAreas(ctx, selectedSections, circles)
  circles.forEach(circle => {
    if (showCircleOutlines) drawCircleOutline(ctx, circle)
    if (showCircleText) drawCircleName(ctx, circle)
  })
}

const getOverlapsArray = (circles: Circle[]) => {
  const overlaps: Overlap[] = []
  const populateOverlaps = (overlapGroup: Circle[] = [], startIndex = 0) => {
    if (overlapGroup.length > 1) {
      const color = backgroundColor
      overlaps.push({
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
        populateOverlaps(overlapGroup, i + 1)
        overlapGroup.pop()
      }
    }
  }

  populateOverlaps()
  return overlaps
}

const highlightOverlappingAreas = (
  ctx: CanvasRenderingContext2D,
  selectedSections: CircleDisplayName[][],
  circles: Circle[]
) => {
  const overlaps = getOverlapsArray(circles)
  // IMPORTANT for render order
  overlaps.sort((a, b) => a.circles.length - b.circles.length)
  /*
    IMPORTANT thing here is that if you want regions that exclude others, render order matters. if you want
    something union with something but excluding something else, then put it behind those and have the stuff render on top of it.
  */
  renderSelectedSections(selectedSections, circles, overlaps) // IMPORTANT has to be after overlaps get generated
  overlaps.forEach(o => drawOverlappingAreas(ctx, o))
}

const renderSelectedSections = (
  highlightIds: CircleDisplayName[][],
  circles: Circle[],
  overlaps: Overlap[],
) => {
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
        const overlapIds = overlap.circles.map(circle => circle.id).sort((a, b) => a.localeCompare(b))
        const sortedIds = [...ids].sort((a, b) => a.localeCompare(b))
        if (JSON.stringify(overlapIds) === JSON.stringify(sortedIds)) {
          overlap.color = highlightColor
        }
      })
    }
  })
}