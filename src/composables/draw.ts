import type { Overlap, Circle, CircleLabel } from '@/types/types'
import { COLORS } from '../utils/constants'
import { getCircle } from '@/utils/circleUtils'

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
  ctx.strokeStyle = COLORS.CIRCLE_OUTLINE
  ctx.stroke()
}

const drawCircleName = (ctx: CanvasRenderingContext2D, circle: Circle) => {
  ctx.font = '15px Arial'
  ctx.fillStyle = COLORS.CIRCLE_OUTLINE;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle'
  ctx.fillText(circle.label, circle.x, circle.y)
  ctx.stroke()
}

const drawOverlappingAreas = (ctx: CanvasRenderingContext2D, circles: Circle[], overlap: Overlap) => {
  ctx.save()
  for (const circleLabel of overlap.circles) {
    const { x, y, radius } = getCircle(circles, circleLabel)
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, 2 * Math.PI)
    ctx.clip()
  }

  ctx.fillStyle = overlap.color
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  ctx.restore()
}

const highlightOverlappingAreas = (
  ctx: CanvasRenderingContext2D,
  selectedSections: CircleLabel[][],
  circles: Circle[],
  overlaps: Overlap[],
) => {
  // IMPORTANT for render order
  /*
    IMPORTANT thing here is that if you want regions that exclude others, render order matters. if you want
    something union with something but excluding something else, then put it behind those and have the stuff render on top of it.
  */
  renderSelectedSections(selectedSections, circles, overlaps) // IMPORTANT has to be after overlaps get generated

  const sortedOverlaps = overlaps.toSorted((a, b) => b.circles.length - a.circles.length);

  for (const overlap of sortedOverlaps) {
    drawOverlappingAreas(ctx, circles, overlap)
  }
}

const renderSelectedSections = (
  selectionsToHighlight: CircleLabel[][],
  circles: Circle[],
  overlaps: Overlap[],
) => {
  for (const circle of circles) {
    circle.color = COLORS.BACKGROUND
  }

  for (const overlap of overlaps) {
    overlap.color = COLORS.BACKGROUND
  }

  for (const selection of selectionsToHighlight) {
    if (selection.length === 1) {
      const [label] = selection
      const circle = getCircle(circles, label)
      circle.color = COLORS.HIGHLIGHT
      break;
    }

    for (const overlap of overlaps) {
      const circlesInOverlap = overlap.circles.toSorted((a, b) => a.localeCompare(b));
      const circlesInSelection = selection.toSorted((a, b) => a.localeCompare(b))
      if (circlesInOverlap.join('.') === circlesInSelection.join('.')) {
        overlap.color = COLORS.HIGHLIGHT
      }
    }
  }
}

export const draw = (
  ctx: CanvasRenderingContext2D,
  circles: Circle[],
  overlaps: Overlap[],
  selectedSections: CircleLabel[][]
) => {
  for (const circle of circles) {
    drawCircleBackground(ctx, circle)
  }

  highlightOverlappingAreas(ctx, selectedSections, circles, overlaps)

  for (const circle of circles) {
    drawCircleOutline(ctx, circle)
    drawCircleName(ctx, circle)
  }
}
