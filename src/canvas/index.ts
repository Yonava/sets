import { onMounted, ref, watch } from "vue"
import { useCamera } from "./camera"
import { useMagicCoordinates } from "./coordinates"
import { getDevicePixelRatio } from "./camera/utils"
import type { DrawContent, UseMagicCanvas } from "./types"
import { useElementSize } from "@vueuse/core"
import { useBackgroundPattern, type DrawPattern } from "./backgroundPattern"
import type { MaybeRef } from 'vue';

/**
 * pulls ctx from a canvas or canvas ref (vue.js), throws if not found
 *
 * @returns {CanvasRenderingContext2D}
 * @example const ctx = getCtx(canvasRef);
 * // ctx is defined and ready to use
 * @throws {Error} if canvas or 2d context not found
 */
export const getCtx = (
  canvasInput: MaybeRef<HTMLCanvasElement | null | undefined>,
) => {
  if (!canvasInput) throw new Error('canvas not found');
  const canvas = 'value' in canvasInput ? canvasInput.value : canvasInput;
  if (!canvas) throw new Error('canvas not found');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2d context not found');
  return ctx;
};

const REPAINT_FPS = 60;

const initCanvasWidthHeight = (canvas: HTMLCanvasElement | undefined) => {
  if (!canvas) throw new Error('Canvas not found in DOM. Check ref link.');

  const dpr = getDevicePixelRatio()
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
}

export const useMagicCanvas: UseMagicCanvas = (options = {}) => {
  const canvas = ref<HTMLCanvasElement>()
  const canvasBoxSize = useElementSize(canvas)

  const drawContent = ref<DrawContent>(() => { })
  const drawBackgroundPattern = ref<DrawPattern>(() => { })

  // @ts-expect-error missing node namespace for some reason
  let repaintInterval: NodeJS.Timeout;

  onMounted(() => {
    initCanvasWidthHeight(canvas.value)
    repaintInterval = setInterval(repaintCanvas, 1000 / REPAINT_FPS);
  })

  watch([canvasBoxSize.width, canvasBoxSize.height], () => initCanvasWidthHeight(canvas.value))

  const { cleanup: cleanupCamera, ...camera } = useCamera(
    canvas,
    options?.storageKey ?? '[default-storage-key]'
  );
  const { coordinates: cursorCoordinates, cleanup: cleanupCoords } = useMagicCoordinates(canvas);

  const pattern = useBackgroundPattern(camera.state, drawBackgroundPattern)

  const repaintCanvas = () => {
    const ctx = getCtx(canvas);
    camera.transformAndClear(ctx);
    pattern.draw(ctx)
    drawContent.value(ctx)
  };

  return {
    canvas,
    camera,
    cursorCoordinates,
    ref: {
      canvasRef: (ref) => canvas.value = ref,
      cleanup: (ref) => {
        cleanupCoords(ref)
        cleanupCamera(ref)
        clearInterval(repaintInterval)
      },
    },
    draw: {
      content: drawContent,
      backgroundPattern: drawBackgroundPattern,
    }
  }
}