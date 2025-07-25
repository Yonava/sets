import type { Overlap, Circle, CircleLabel } from '@/types/types'
import { COLORS } from '../utils/sets/constants'
import { getCircle } from '@/utils/sets/circleUtils'

const drawCircleBackground = (ctx: CanvasRenderingContext2D, circle: Circle, isHighlighted: boolean) => {
  ctx.beginPath()
  ctx.arc(circle.x, circle.y, circle.radius, 0, 2 * Math.PI, false)
  ctx.fillStyle = isHighlighted ? COLORS.HIGHLIGHT : COLORS.BACKGROUND;
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

const drawOverlappingAreas = (ctx: CanvasRenderingContext2D, circles: Circle[], overlap: Overlap, isHighlighted: boolean) => {
  ctx.save()
  // for (const circleLabel of overlap.circles) {
  //   const { x, y, radius } = getCircle(circles, circleLabel)
  //   ctx.beginPath()
  //   ctx.arc(x, y, radius, 0, 2 * Math.PI)
  //   ctx.clip()
  // }

  ctx.fillStyle = 'blue';
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.restore()
}

const colorOverlappingAreas = (
  ctx: CanvasRenderingContext2D,
  circles: Circle[],
  overlaps: Overlap[],
  highlightedOverlaps: Set<Overlap['id']>,
) => {
  const sortedOverlaps = overlaps.toSorted((a, b) => a.circles.length - b.circles.length);
  // IMPORTANT for render order
  /*
    IMPORTANT thing here is that if you want regions that exclude others, render order matters. if you want
    something union with something but excluding something else, then put it behind those and have the stuff render on top of it.
  */
  // IMPORTANT has to be after overlaps get generated

  for (const overlap of sortedOverlaps) {
    log2(overlap.circles, highlightedOverlaps.has(overlap.id))
    drawOverlappingAreas(ctx, circles, overlap, highlightedOverlaps.has(overlap.id))
  }
}

const getHighlightedSections = (
  selectionsToHighlight: CircleLabel[][],
  overlaps: Overlap[],
) => {
  const highlightedCircles = new Set<Circle['label']>()
  const highlightedOverlaps = new Set<Overlap['id']>()

  for (const selection of selectionsToHighlight) {
    if (selection.length === 1) {
      const [label] = selection
      highlightedCircles.add(label)
      continue;
    }

    for (const overlap of overlaps) {
      const circlesInOverlap = overlap.circles.toSorted((a, b) => a.localeCompare(b));
      const circlesInSelection = selection.toSorted((a, b) => a.localeCompare(b))
      if (circlesInOverlap.join('.') === circlesInSelection.join('.')) {
        highlightedOverlaps.add(overlap.id)
      }
    }
  }

  return {
    highlightedCircles,
    highlightedOverlaps,
  }
}

export const useCooldownLog = (frequencyMs = 1000) => {
  let cooldown = false;
  const log = (...data: any[]) => {
    if (cooldown) return;
    console.log(...data)
    cooldown = true
  }
  setInterval(() => cooldown = false, frequencyMs)
  return log
}

const log = useCooldownLog()
const log2 = useCooldownLog()

export const draw = (
  ctx: CanvasRenderingContext2D,
  circles: Circle[],
  overlaps: Overlap[],
  selectedSections: CircleLabel[][]
) => {
  const {
    highlightedCircles,
    highlightedOverlaps,
  } = getHighlightedSections(selectedSections, overlaps)

  ctx.fillStyle = 'blue';
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // log(Array.from(highlightedOverlaps))

  // colorOverlappingAreas(ctx, circles, overlaps, highlightedOverlaps)

  // for (const circle of circles) {
  //   drawCircleBackground(ctx, circle, highlightedCircles.has(circle.label))
  // }

  for (const circle of circles) {
    drawCircleOutline(ctx, circle)
    drawCircleName(ctx, circle)
  }
}
