<template>
  <MagicCanvas
    v-bind="magic.ref"
    @mousedown="startDrag"
    @mousemove="drag"
    @mouseup="endDrag"
    @mouseleave="endDrag"
    @dblclick="createCircle"
    @click.left="handleCanvasClick"
  />
</template>

<script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount, reactive, watch } from "vue";
  import type { Circle, Overlap } from "../types/types";
  import useRenderCanvas from "../composables/useRenderCanvas";
  import { isInsideCircle, isOnEdge } from "../utils/circleUtils";
  import { convertNameListToIdList } from "../utils/idToNameUtils";
  import allSelectablePiecesGetter from "../composables/allSelectablePiecesGetter";
  import { highlightColor, backgroundColor } from "../utils/constants";
  import MagicCanvas from "@/canvas/MagicCanvas.vue";
  import { getCtx, useMagicCanvas } from "@/canvas";

  const magic = useMagicCanvas();

  // magic.draw.content.value = () => {
  //   canvasColor.value = props.sectionsToHighlight.some(
  //     (arr) => JSON.stringify(arr) === JSON.stringify(["S"])
  //   )
  //     ? highlightColor
  //     : backgroundColor;
  //   drawCircles(convertNameListToIdList(props.sectionsToHighlight));
  //   drawCircles(convertNameListToIdList(props.sectionsToHighlight));
  // };

  const allSections = defineModel<string[][]>();

  const props = defineProps<{
    sectionsToHighlight: string[][];
  }>();

  const currentCircleId = ref(1);
  const circlesSelectedByDrag = ref(false);

  const dragging = ref(false);
  const resizing = ref(false);
  const currentCircleIndex = ref<number | null>(null);
  const isSelecting = ref(false);
  const selectionStartPoint = reactive({ x: 0, y: 0 });

  const currentOverlapId = ref(1);
  const overlaps = reactive<Overlap[]>([]);
  const selectedOverlap = ref<Overlap | null>(null);

  const circles = reactive<Circle[]>([]);

  const canvasColor = ref<typeof backgroundColor | typeof highlightColor>(
    backgroundColor
  );

  const getAllSelectablePieces = allSelectablePiecesGetter();

  const { drawCircles } = useRenderCanvas(
    magic.canvas,
    circles,
    overlaps,
    currentOverlapId,
    selectedOverlap
  );

  watch(props, () => {
    canvasColor.value = props.sectionsToHighlight.some(
      (arr) => JSON.stringify(arr) === JSON.stringify(["S"])
    )
      ? highlightColor
      : backgroundColor;
    drawCircles(convertNameListToIdList(props.sectionsToHighlight));
    drawCircles(convertNameListToIdList(props.sectionsToHighlight));
  });

  type CursorStyle = "auto" | "grab" | "grabbing" | "ew-resize" | "ns-resize";

  const cursorStyle = ref<CursorStyle>("auto");

  const getAngleBetweenTwoPoints = (
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ) => {
    return Math.atan2(Math.abs(y1 - y2), Math.abs(x1 - x2));
  };

  const updateCursorStyle = (mouseX: number, mouseY: number): CursorStyle => {
    for (let i = circles.length - 1; i >= 0; i--) {
      if (isOnEdge(mouseX, mouseY, circles[i]))
        return getAngleBetweenTwoPoints(
          mouseX,
          mouseY,
          circles[i].x,
          circles[i].y
        ) > 0.75
          ? "ns-resize"
          : "ew-resize";
      if (isInsideCircle(mouseX, mouseY, circles[i])) return "grab";
    }
    return "auto";
  };

  const findLastIndex = <T>(
    arr: T[],
    predicate: (value: T, index: number, obj: T[]) => boolean
  ) => {
    for (let i = arr.length - 1; i >= 0; i--) {
      if (predicate(arr[i], i, arr)) {
        return i;
      }
    }
    return -1;
  };

  const startDrag = () => {
    canvasIsActive.value = true;
    const { x, y } = magic.cursorCoordinates.value;
    currentCircleIndex.value = findLastIndex(
      circles,
      (circle) => isInsideCircle(x, y, circle) || isOnEdge(x, y, circle)
    );

    if (currentCircleIndex.value !== -1) {
      const circle = circles[currentCircleIndex.value];
      if (isOnEdge(x, y, circle)) {
        resizing.value = true;
      } else {
        dragging.value = true;
        cursorStyle.value = "grabbing";
      }

      const selectedCirclesCount = circles.filter((c) => c.selected).length;

      // Determine if we should select only the clicked circle
      const selectOnlyClicked =
        selectedCirclesCount < 2 &&
        !(pressedKeys.has("ControlLeft") || pressedKeys.has("ControlRight"));

      circles.forEach((circle, index) => {
        if (selectOnlyClicked) {
          circle.selected = index === currentCircleIndex.value;
        } else if (index === currentCircleIndex.value) {
          circle.selected = true;
        }
      });

      circles.forEach((circle) => {
        if (circle.selected) {
          circle.offsetX = x - circle.x;
          circle.offsetY = y - circle.y;
        }
      });

      // larger circles on bottom
      circles.sort((a, b) => b.radius - a.radius);

      // this is for last clicked goes on top
      // circles.push(circles.splice(currentCircleIndex.value, 1)[0])
      // currentCircleIndex.value = circles.length - 1
    } else {
      startSelection();
    }
  };

  const drag = () => {
    const { x, y } = magic.cursorCoordinates.value;

    allSections.value = getAllSelectablePieces(circles, overlaps);
    if (
      (dragging.value || resizing.value) &&
      currentCircleIndex.value !== null
    ) {
      if (dragging.value) {
        circles.forEach((c) => {
          if (c.selected) {
            c.x = x - c.offsetX;
            c.y = y - c.offsetY;
          }
        });
      } else if (resizing.value) {
        const circle = circles[currentCircleIndex.value];
        const dx = x - circle.x;
        const dy = y - circle.y;
        circle.radius = Math.max(30, Math.sqrt(dx * dx + dy * dy));
      }

      drawCircles(convertNameListToIdList(props.sectionsToHighlight));
    } else {
      drawSelection();
      if (!isSelecting.value) cursorStyle.value = updateCursorStyle(x, y);
    }
  };

  const endDrag = () => {
    dragging.value = false;
    resizing.value = false;
    const { x, y } = magic.cursorCoordinates.value;
    cursorStyle.value = updateCursorStyle(x, y);

    currentCircleIndex.value = null;
    endSelection();
  };

  const createCircle = () => {
    if (pressedKeys.has("ControlLeft") || pressedKeys.has("ControlRight"))
      return;
    const { x, y } = magic.cursorCoordinates.value;
    circles.forEach((circle) => (circle.selected = false));
    circles.push({
      id: currentCircleId.value,
      x,
      y,
      radius: 70,
      selected: true,
      color: backgroundColor,
      offsetX: 0,
      offsetY: 0,
    });
    currentCircleId.value++;
    drawCircles(convertNameListToIdList(props.sectionsToHighlight));
  };

  const handleCanvasClick = () => {
    canvasIsActive.value = true;
    const { x, y } = magic.cursorCoordinates.value;

    // Selecting Circle Sections:
    // TODO: INCOMPLETE needs to be able to select subsections

    // let foundOverlap = false

    // for (let i = overlaps.length - 1; i >= 0; i--) {
    //   const allInside = overlaps[i].circles.every(circle => isInsideCircle(x, y, circle))
    //   if (allInside && !foundOverlap) {
    //     foundOverlap = true
    //     break
    //   }
    // }

    const clickedCircleIndex = circles.findIndex((circle) =>
      isInsideCircle(x, y, circle)
    );

    if (clickedCircleIndex === -1 && !circlesSelectedByDrag.value) {
      if (!(pressedKeys.has("ControlLeft") || pressedKeys.has("ControlRight")))
        circles.forEach((circle) => (circle.selected = false));
      selectedOverlap.value = null;
    }
    drawCircles(convertNameListToIdList(props.sectionsToHighlight));

    circlesSelectedByDrag.value = false;
  };

  const deleteCircle = () => {
    for (let i = circles.length - 1; i >= 0; i--) {
      if (circles[i].selected) {
        circles.splice(i, 1);
      }
    }

    drawCircles(convertNameListToIdList(props.sectionsToHighlight));
  };

  const startSelection = () => {
    const { x, y } = magic.cursorCoordinates.value;
    Object.assign(selectionStartPoint, { x, y });
    isSelecting.value = true;
  };

  const drawSelection = () => {
    if (!isSelecting.value) return;

    const ctx = getCtx(magic.canvas);
    const { x, y } = magic.cursorCoordinates.value;
    const currentPoint = { x, y };

    const width = currentPoint.x - selectionStartPoint.x;
    const height = currentPoint.y - selectionStartPoint.y;

    drawCircles(convertNameListToIdList(props.sectionsToHighlight));

    ctx.strokeStyle = "blue";
    ctx.lineWidth = 1;
    ctx.strokeRect(selectionStartPoint.x, selectionStartPoint.y, width, height);
    ctx.fillStyle = "rgba(0, 0, 255, 0.2)";
    ctx.fillRect(selectionStartPoint.x, selectionStartPoint.y, width, height);

    const minX = Math.min(selectionStartPoint.x, currentPoint.x);
    const maxX = Math.max(selectionStartPoint.x, currentPoint.x);
    const minY = Math.min(selectionStartPoint.y, currentPoint.y);
    const maxY = Math.max(selectionStartPoint.y, currentPoint.y);

    circles.forEach((circle) => {
      circle.selected =
        circle.x >= minX &&
        circle.x <= maxX &&
        circle.y >= minY &&
        circle.y <= maxY;
      if (circle.selected) circlesSelectedByDrag.value = true;
    });
  };

  const endSelection = () => {
    isSelecting.value = false;
  };

  const pressedKeys = new Set();

  const eventListeners = [
    {
      keyCode: "Backspace",
      action: () => {
        if (canvasIsActive.value) deleteCircle();
      },
    },
    {
      keyCode: "Escape",
      action: () => circles.forEach((circle) => (circle.selected = false)),
    },
  ];

  const handleKeyDown = (event: KeyboardEvent) => {
    pressedKeys.add(event.code);
    eventListeners.forEach((listener) => {
      if (listener.keyCode === event.code) {
        listener.action();
      }
    });
    drawCircles(convertNameListToIdList(props.sectionsToHighlight));
  };

  const handleKeyUp = (event: KeyboardEvent) => {
    pressedKeys.delete(event.code);
  };

  const canvasIsActive = ref(true);

  const handleClickOutside = (event: MouseEvent) => {
    if (
      magic.canvas.value &&
      !magic.canvas.value.contains(event.target as Node)
    ) {
      circles.forEach((circle) => (circle.selected = false));
      canvasIsActive.value = false;
    }
  };

  onBeforeUnmount(() => {
    window.removeEventListener("keydown", () => {});
    window.removeEventListener("keyup", () => {});
    window.removeEventListener("click", handleClickOutside);
  });
  onMounted(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("click", handleClickOutside);
  });
</script>

<style scoped>
  canvas {
    background: v-bind(canvasColor);
    cursor: v-bind(cursorStyle);
  }
</style>
