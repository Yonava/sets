import { getMagicCoordinates } from "@/canvas/coordinates"
import { getCircle } from "../other/circleUtils"
import type { Circle, Overlap } from "../types/types"
import { rect } from "@/shapes/shapes/rect"
import { COLORS } from "../other/constants"

type DrawOverlappingAreaProps = {
  circles: Circle[],
  overlap: Overlap,
  isHighlighted: boolean
}

export const drawOverlappingAreas = (ctx: CanvasRenderingContext2D, props: DrawOverlappingAreaProps) => {
  const { overlap, circles, isHighlighted } = props
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

type ColorOverlappingAreasProps = {
  circles: Circle[],
  overlaps: Overlap[],
  highlightedOverlaps: Set<Overlap['id']>,
}

export const colorOverlappingAreas = (
  ctx: CanvasRenderingContext2D,
  props: ColorOverlappingAreasProps
) => {
  const { circles, overlaps, highlightedOverlaps } = props
  const sortedOverlaps = overlaps.toSorted((a, b) => a.circles.length - b.circles.length);
  /*
    IMPORTANT thing here is that if you want regions that exclude others, render order matters. if you want
    something union with something but excluding something else, then put it behind those and have the stuff render on top of it.
  */
  for (const overlap of sortedOverlaps) {
    drawOverlappingAreas(ctx, {
      circles,
      overlap,
      isHighlighted: highlightedOverlaps.has(overlap.id)
    })
  }
}