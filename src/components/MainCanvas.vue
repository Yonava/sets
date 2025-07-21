<template>
  <MagicCanvas
    v-bind="magic.ref"
    @dblclick="createCircle"
  />
</template>

<script setup lang="ts">
  import { computed, ref } from "vue";
  import type { Circle, CircleDisplayName, Overlap } from "../types/types";
  import { useRenderCanvas } from "../composables/useRenderCanvas";
  import { convertNameListToIdList } from "../utils/idToNameUtils";
  import { getAllSelectablePieces } from "../composables/allSelectablePiecesGetter";
  import { highlightColor, backgroundColor } from "../utils/constants";
  import MagicCanvas from "@/canvas/MagicCanvas.vue";
  import { useMagicCanvas } from "@/canvas";
  import { useCanvasFocus } from "./extras";

  const magic = useMagicCanvas();

  const allSections = defineModel<string[][]>();

  const props = defineProps<{
    sectionsToHighlight: CircleDisplayName[][];
  }>();

  const { canvasFocused } = useCanvasFocus(magic.canvas);
  const overlaps = ref<Overlap[]>([]);

  const circles = ref<Circle[]>([]);

  const entireSetSpaceHighlighted = computed(() => {
    return props.sectionsToHighlight.some((section) => {
      return section.length === 1 && section[0] === "S";
    });
  });

  const canvasColor = computed(() => {
    return entireSetSpaceHighlighted ? highlightColor : backgroundColor;
  });

  const drawCircles = useRenderCanvas(magic.canvas, circles.value);

  const createCircle = () => {
    const { x, y } = magic.cursorCoordinates.value;
    circles.value.push({
      id: currentCircleId.value,
      x,
      y,
      radius: 70,
      color: backgroundColor,
    });
    drawCircles(convertNameListToIdList(props.sectionsToHighlight));

    allSections.value = getAllSelectablePieces(circles.value, overlaps.value);
  };
</script>

<style scoped>
  canvas {
    background: v-bind(canvasColor);
  }
</style>
