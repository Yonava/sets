import type { MagicCanvasProps } from "@/canvas/types";
import { useDrag } from "./useDrag";
import type { Ref } from "vue";
import type { Circle } from "../types/types";
import { circle } from "@/shapes/shapes/circle";

export const useCircleDrag = (
  magicCanvas: MagicCanvasProps,
  circles: Ref<Circle[]>
) => useDrag(
  magicCanvas,
  (coord) => circles.value.toSorted((a, b) => a.radius - b.radius).find((c) => circle(c).hitbox(coord)),
  (item, diff) => {
    item.at.x = item.at.x + diff.x;
    item.at.y = item.at.y + diff.y;
  }
)