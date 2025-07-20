import { useLocalStorage } from "@vueuse/core";
import { onMounted, type Ref } from "vue";

/**
 * https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button
 */
export const MOUSE_BUTTONS = {
  left: 0,
  middle: 1,
  right: 2,
} as const;

export const MIN_ZOOM = 0.2;
export const MAX_ZOOM = 10;

export const ZOOM_SENSITIVITY = 0.02;
export const PAN_SENSITIVITY = 1;

export const usePanAndZoom = (canvas: Ref<HTMLCanvasElement | undefined>, storageKey: string) => {
  const panX = useLocalStorage('camera-pan-x', 0)
  const panY = useLocalStorage('camera-pan-y', 0)
  const zoom = useLocalStorage('camera-zoom', 1)

  const setZoom = (ev: Pick<WheelEvent, 'clientX' | 'clientY' | 'deltaY'>) => {
    const { clientX: cx, clientY: cy } = ev

    // clamp deltaY to a max range to prevent mice with large deltaY notches from feeling too sensitive
    const normalizedDelta = Math.max(-100, Math.min(100, ev.deltaY));
    const zoomFactor = Math.exp(-normalizedDelta * ZOOM_SENSITIVITY);
    const clampedZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom.value * zoomFactor));

    const scale = clampedZoom / zoom.value;

    panX.value = cx - (cx - panX.value) * scale;
    panY.value = cy - (cy - panY.value) * scale;
    zoom.value = clampedZoom
  }

  const setPan = (ev: Pick<WheelEvent, 'deltaX' | 'deltaY'>) => {
    panX.value -= ev.deltaX * PAN_SENSITIVITY
    panY.value -= ev.deltaY * PAN_SENSITIVITY
  }

  const onWheel = (ev: WheelEvent) => {
    ev.preventDefault();

    const isPanning = !ev.ctrlKey;
    const maneuverCamera = isPanning ? setPan : setZoom
    maneuverCamera(ev)
  };

  let lastX = 0;
  let lastY = 0;
  let middleMouseDown = false;

  const onMousedown = (ev: MouseEvent) => {
    middleMouseDown = ev.button === MOUSE_BUTTONS.middle
    if (!middleMouseDown) return

    lastX = ev.clientX
    lastY = ev.clientY
  }

  const onMousemove = (ev: MouseEvent) => {
    if (!middleMouseDown) return

    setPan({
      deltaX: lastX - ev.clientX,
      deltaY: lastY - ev.clientY
    })

    lastX = ev.clientX
    lastY = ev.clientY
  }

  const onMouseup = () => {
    lastX = 0
    lastY = 0
    middleMouseDown = false
  }

  onMounted(() => {
    if (!canvas.value) throw new Error("canvas not found in DOM");
    canvas.value.addEventListener("wheel", onWheel, { passive: false });
    canvas.value.addEventListener("mousedown", onMousedown)
    canvas.value.addEventListener("mousemove", onMousemove)
    document.addEventListener('mouseup', onMouseup)
  });

  return {
    actions: {
      zoomIn: (increment = 12.5) => setZoom({
        deltaY: -increment,
        clientX: window.innerWidth / 2,
        clientY: window.innerHeight / 2
      }),
      zoomOut: (decrement = 12.5) => setZoom({
        deltaY: decrement,
        clientX: window.innerWidth / 2,
        clientY: window.innerHeight / 2
      }),
    },
    state: {
      panX,
      panY,
      zoom,
    },
    getTransform: () => ({
      scaleX: zoom.value,
      scaleY: zoom.value,
      translateX: panX.value,
      translateY: panY.value,
    }),
    cleanup: (ref: HTMLCanvasElement) => {
      ref.removeEventListener("wheel", onWheel);
      ref.removeEventListener("mousedown", onMousedown)
      ref.removeEventListener("mousemove", onMousemove)
      document.removeEventListener('mouseup', onMouseup)
    }
  };
};
