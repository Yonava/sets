import { getMagicCoordinates } from "@/canvas/coordinates"
import { getCircle } from "../other/circleUtils"
import type { Circle, Overlap } from "../types/types"
import { COLORS } from "../other/constants"
import { getHatchPattern } from "./hatchPattern"

type DrawOverlappingAreaProps = {
  circles: Circle[],
  overlap: Overlap,
  highlightColors: string[] | null,
}

const drawOverlappingAreas = (ctx: CanvasRenderingContext2D, props: DrawOverlappingAreaProps) => {
  const { overlap, circles, highlightColors } = props
  ctx.save()

  for (const circleLabel of overlap.circles) {
    const { at: { x, y }, radius } = getCircle(circles, circleLabel)
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, 2 * Math.PI)
    ctx.clip()
  }

  const startingCoords = getMagicCoordinates({ clientX: 0, clientY: 0 }, ctx)
  const endingCoords = getMagicCoordinates({ clientX: window.innerWidth, clientY: window.innerHeight }, ctx)

  if (highlightColors === null) {
    ctx.fillStyle = COLORS.BACKGROUND
  } else if (highlightColors.length === 1) {
    ctx.fillStyle = highlightColors[0]
  } else {
    ctx.imageSmoothingEnabled = false
    ctx.fillStyle = getHatchPattern(ctx, highlightColors)
  }

  ctx.fillRect(
    startingCoords.x, startingCoords.y,
    endingCoords.x - startingCoords.x,
    endingCoords.y - startingCoords.y,
  )

  ctx.restore()
}

type ColorOverlappingAreasProps = {
  circles: Circle[],
  overlaps: Overlap[],
  highlightedCircles: Map<Circle['label'], string[]>,
  highlightedOverlaps: Map<Overlap['id'], string[]>,
}

export const colorOverlappingAreas = (
  ctx: CanvasRenderingContext2D,
  props: ColorOverlappingAreasProps
) => {
  const { circles, overlaps, highlightedCircles, highlightedOverlaps } = props
  for (const overlap of overlaps) {
    const highlightColors = highlightedOverlaps.get(overlap.id) ?? null
    if (!highlightColors && !overlap.circles.some(label => highlightedCircles.has(label))) continue
    drawOverlappingAreas(ctx, { circles, overlap, highlightColors })
  }
}
