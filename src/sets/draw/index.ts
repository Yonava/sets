import type { CircleFocusControls } from "../composables/useCircleFocus"
import type { Circle, Overlap, HighlightGroup } from "../types/types"
import { drawCircleBackground, drawCircleLabel, drawCircleOutline } from "./circles"
import { colorOverlappingAreas } from "./overlaps"

type GetHighlightedSectionsProps = {
  highlightGroups: HighlightGroup[],
  overlaps: Overlap[],
}

const getHighlightedSections = (props: GetHighlightedSectionsProps) => {
  const highlightedCircles = new Map<Circle['label'], string>()
  const highlightedOverlaps = new Map<Overlap['id'], string>()

  for (const { sections, color } of props.highlightGroups) {
    for (const section of sections) {
      if (section.length === 1) {
        const [label] = section
        highlightedCircles.set(label, color)
        continue;
      }

      for (const overlap of props.overlaps) {
        const circlesInOverlap = overlap.circles.toSorted((a, b) => a.localeCompare(b));
        const circlesInSelection = section.toSorted((a, b) => a.localeCompare(b))
        if (circlesInOverlap.join('.') === circlesInSelection.join('.')) {
          highlightedOverlaps.set(overlap.id, color)
        }
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
  highlightGroups: HighlightGroup[],
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
      highlightColor: highlightedCircles.get(circle.label) ?? null,
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
