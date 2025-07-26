import { onMounted, ref } from "vue"
import { useCamera } from "./camera"
import { useMagicCoordinates } from "./coordinates"
import type { DrawContent, UseMagicCanvas } from "./types"
import { useBackgroundPattern, type DrawPattern } from "./backgroundPattern"
import { getCtx } from "@/utils/ctx"

const REPAINT_FPS = 60;

const initCanvasFullScreen = (canvas: HTMLCanvasElement) => {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
};

export const useMagicCanvas: UseMagicCanvas = (options = {}) => {
  const canvas = ref<HTMLCanvasElement>()

  const drawContent = ref<DrawContent>(() => { })
  const drawBackgroundPattern = ref<DrawPattern>(() => { })

  // @ts-expect-error missing node namespace for some reason
  let repaintInterval: NodeJS.Timeout;

  onMounted(() => {
    initCanvasFullScreen(canvas.value!)
    repaintInterval = setInterval(repaintCanvas, 1000 / REPAINT_FPS);
  })

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