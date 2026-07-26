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

const getProperNonEmptySubsets = (labels: Circle['label'][]): Circle['label'][][] => {
  const subsets: Circle['label'][][] = []
  for (let mask = 1; mask < (2 ** labels.length) - 1; mask++) {
    subsets.push(labels.filter((_, i) => mask & (1 << i)))
  }
  return subsets
}

export const colorOverlappingAreas = (
  ctx: CanvasRenderingContext2D,
  props: ColorOverlappingAreasProps
) => {
  const { circles, overlaps, highlightedCircles, highlightedOverlaps } = props

  const overlapIdByKey = new Map<string, Overlap['id']>()
  for (const overlap of overlaps) {
    const key = overlap.circles.toSorted((a, b) => a.localeCompare(b)).join('.')
    overlapIdByKey.set(key, overlap.id)
  }

  // an overlap region is geometrically nested inside every region formed by a
  // subset of its circles, so it must be redrawn (even just to erase it back to
  // background) whenever a single circle or a smaller
  // overlap is highlighted, otherwise that region's fill bleeds through
  const hasHighlightedAncestor = (labels: Circle['label'][]) => {
    for (const subset of getProperNonEmptySubsets(labels)) {
      if (subset.length === 1) {
        if (highlightedCircles.has(subset[0])) return true
        continue
      }
      const key = subset.toSorted((a, b) => a.localeCompare(b)).join('.')
      const id = overlapIdByKey.get(key)
      if (id !== undefined && highlightedOverlaps.has(id)) return true
    }
    return false
  }

  for (const overlap of overlaps) {
    const highlightColors = highlightedOverlaps.get(overlap.id) ?? null
    if (!highlightColors && !hasHighlightedAncestor(overlap.circles)) continue
    drawOverlappingAreas(ctx, { circles, overlap, highlightColors })
  }
}
