import { ref, type Ref } from "vue"
import type { Circle } from "../types/types"
import type { MagicCanvasProps } from "@/canvas/types"

type CircleFocusProps = {
  circles: Ref<Circle[]>,
  magicCanvas: MagicCanvasProps,
}

export const useCircleFocus = ({
  circles,
  magicCanvas,
}: CircleFocusProps) => {
  const focusedCircleLabels = ref(new Set<Circle['label']>())

  return {
    focusedCircleIds: focusedCircleLabels,
    isCircleFocused: (label: Circle['label']) => focusedCircleLabels.value.has(label),
  }
}

export type CircleFocusControls = ReturnType<typeof useCircleFocus>