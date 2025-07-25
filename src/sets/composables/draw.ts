import type { Overlap, Circle, CircleLabel } from '@/sets/types/types'
import { COLORS } from '@/sets/other/constants'
import { getCircle } from '@/sets/other/circleUtils'
import { getMagicCoordinates } from '@canvas/coordinates'
import { rect } from '@shapes/rect'
import { circle } from '@/shapes/shapes/circle'
import type { CircleSchema } from '@/shapes/shapes/circle/types'

const drawCircleBackground = (ctx: CanvasRenderingContext2D, circleProps: CircleSchema, isHighlighted: boolean) => {
  circle({
    ...circleProps,
    fillColor: isHighlighted ? COLORS.HIGHLIGHT : 'transparent',
  }).draw(ctx)
}

const drawCircleOutline = (ctx: CanvasRenderingContext2D, circle: Circle) => {
  ctx.beginPath()
  ctx.arc(circle.at.x, circle.at.y, circle.radius, 0, 2 * Math.PI)
  ctx.lineWidth = 3
  ctx.strokeStyle = COLORS.CIRCLE_OUTLINE
  ctx.stroke()
}

const drawCircleName = (ctx: CanvasRenderingContext2D, circle: Circle) => {
  ctx.font = '15px Arial'
  ctx.fillStyle = COLORS.CIRCLE_OUTLINE;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle'
  ctx.fillText(circle.label, circle.at.x, circle.at.y)
  ctx.stroke()
}

const drawOverlappingAreas = (ctx: CanvasRenderingContext2D, circles: Circle[], overlap: Overlap, isHighlighted: boolean) => {
  ctx.save()

  for (const circleLabel of overlap.circles) {
    const { at: { x, y }, radius } = getCircle(circles, circleLabel)
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, 2 * Math.PI)
    ctx.clip()
  }

  const startingCoords = getMagicCoordinates({
    clientX: 0,
    clientY: 0,
  }, ctx)

  const endingCoords = getMagicCoordinates({
    clientX: window.innerWidth,
    clientY: window.innerHeight
  }, ctx)

  rect({
    at: startingCoords,
    width: endingCoords.x - startingCoords.x,
    height: endingCoords.y - startingCoords.y,
    fillColor: isHighlighted ? COLORS.HIGHLIGHT : COLORS.BACKGROUND,
  }).draw(ctx);

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

  for (const circle of circles) {
    drawCircleBackground(ctx, circle, highlightedCircles.has(circle.label))
  }

  colorOverlappingAreas(ctx, circles, overlaps, highlightedOverlaps)

  for (const circle of circles) {
    drawCircleOutline(ctx, circle)
    drawCircleName(ctx, circle)
  }
}