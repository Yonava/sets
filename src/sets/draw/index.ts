import type { CircleFocusControls } from "../composables/useCircleFocus"
import type { Circle, Overlap } from "../types/types"
import { drawCircleBackground, drawCircleLabel, drawCircleOutline } from "./circles"
import { colorOverlappingAreas } from "./overlaps"

type GetHighlightedSectionsProps = {
  selectedSections: Circle['label'][][],
  overlaps: Overlap[],
}

export const getHighlightedSections = (props: GetHighlightedSectionsProps) => {
  const highlightedCircles = new Set<Circle['label']>()
  const highlightedOverlaps = new Set<Overlap['id']>()

  for (const section of props.selectedSections) {
    if (section.length === 1) {
      const [label] = section
      highlightedCircles.add(label)
      continue;
    }

    for (const overlap of props.overlaps) {
      const circlesInOverlap = overlap.circles.toSorted((a, b) => a.localeCompare(b));
      const circlesInSelection = section.toSorted((a, b) => a.localeCompare(b))
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

type DrawProps = {
  circles: Circle[],
  overlaps: Overlap[],
  selectedSections: Circle['label'][][],
  isCircleFocused: CircleFocusControls['isCircleFocused'],
}

export const draw = (ctx: CanvasRenderingContext2D, props: DrawProps) => {
  const {
    highlightedCircles,
    highlightedOverlaps,
  } = getHighlightedSections(props)

  for (const circle of props.circles) {
    drawCircleBackground(ctx, {
      circle,
      isHighlighted: highlightedCircles.has(circle.label),
    })
  }

  colorOverlappingAreas(ctx, {
    ...props,
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
