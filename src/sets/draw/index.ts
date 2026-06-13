import type { CircleFocusControls } from "../composables/useCircleFocus"
import type { Circle, Overlap } from "../types/types"
import { drawCircleBackground, drawCircleLabel, drawCircleOutline } from "./circles"
import { colorOverlappingAreas } from "./overlaps"

type DrawProps = {
  circles: Circle[],
  overlaps: Overlap[],
  highlightedCircles: Map<Circle['label'], string>,
  highlightedOverlaps: Map<Overlap['id'], string>,
  isCircleFocused: CircleFocusControls['isCircleFocused'],
}

export const draw = (ctx: CanvasRenderingContext2D, props: DrawProps) => {
  const { highlightedCircles, highlightedOverlaps } = props

  for (const circle of props.circles) {
    drawCircleBackground(ctx, {
      circle,
      highlightColor: highlightedCircles.get(circle.label) ?? null,
    })
  }

  colorOverlappingAreas(ctx, {
    circles: props.circles,
    overlaps: props.overlaps,
    highlightedCircles,
    highlightedOverlaps,
  })

  for (const circle of props.circles) {
    const options = {
      circle,
      isFocused: props.isCircleFocused(circle.label)
    }
    drawCircleOutline(ctx, options)
    drawCircleLabel(ctx, options)
  }
}
