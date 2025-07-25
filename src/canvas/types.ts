import type { Ref } from "vue"
import type { Camera } from "./camera"
import type { DrawPattern } from "./backgroundPattern"
import type { Coordinate } from "@/shapes/types/utility"

export type DrawContent = (ctx: CanvasRenderingContext2D) => void

export type DrawFns = {
  content: Ref<DrawContent>,
  backgroundPattern: Ref<DrawPattern>
}

export type MagicCanvasProps = {
  canvas: Ref<HTMLCanvasElement | undefined>
  camera: Omit<Camera, 'cleanup'>,
  cursorCoordinates: Ref<Coordinate>,
  ref: {
    canvasRef: (canvas: HTMLCanvasElement) => void,
    cleanup: (canvas: HTMLCanvasElement) => void,
  },
  draw: DrawFns,
}

export type MagicCanvasOptions = {
  /**
   * a key that is used to track the camera state in localStorage
   */
  storageKey?: string
}

export type UseMagicCanvas = (options?: MagicCanvasOptions) => MagicCanvasProps
