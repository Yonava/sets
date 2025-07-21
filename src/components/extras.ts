import type { MagicCanvasProps } from "@/canvas/types";
import type { Circle, Overlap } from "@/types/types";
import { onClickOutside } from "@vueuse/core";
import { computed, onBeforeUnmount, onMounted, ref, type Ref } from "vue";

/**
 * generates a new, random, id
 * @example generateId() // 'abc123'
 */
export const generateId = () => Math.random().toString(36).substring(2, 9);

export const useCanvasFocus = (canvas: MagicCanvasProps['canvas']) => {
  const canvasFocused = ref(true);

  const blurCanvas = () => (canvasFocused.value = false);
  const focusCanvas = () => {
    const el = document.activeElement;
    if (el instanceof HTMLElement && typeof el.blur === "function") el.blur();
    canvasFocused.value = true;
  };

  onClickOutside(canvas, blurCanvas);

  onMounted(() => {
    if (!canvas.value) throw 'no canvas found'
    canvas.value.addEventListener('mousedown', focusCanvas)
  })

  onBeforeUnmount(() => {
    if (!canvas.value) throw 'no canvas found'
    canvas.value.removeEventListener('mousedown', focusCanvas)
  })

  return { canvasFocused }
}

/**
 * all individual sections of the set space
 */
export const useAllSections = (circles: Ref<Circle[]>, overlaps: Ref<Overlap[]>) => {
  return computed(() => {
    const overlapsWithNames = overlaps.value.map(o => o.circles.map(c => c.id))
    const circlesByThemselves = circles.value.map(c => c.id).map(id => [id])

    return [
      ...overlapsWithNames,
      ...circlesByThemselves,
      ['S'],
    ]
  })
}