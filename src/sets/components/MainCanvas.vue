<template>
  <MagicCanvas
    v-bind="magicCanvas.ref"
    @dblclick="createCircle"
  />
</template>

<script setup lang="ts">
  import { computed, ref, watch } from "vue";
  import type { Circle, CircleLabel } from "../types/types";
  import { draw } from "../other/draw";
  import { COLORS } from "@/sets/other/constants";
  import MagicCanvas from "@canvas/MagicCanvas.vue";
  import { useMagicCanvas } from "@canvas/index";
  import { useLabelGetter } from "./useLabel";
  import { useOverlaps } from "@/sets/composables/useCalculateOverlaps";
  import { useCanvasFocus } from "@/sets/composables/useCanvasFocus";
  import { useAllSections } from "@/sets/composables/useAllSections";
  import { cross } from "@/shapes/shapes/cross";
  import { useCircleDrag } from "../composables/useCircleDrag";
  import { useCircleResize } from "../composables/useCircleResize";

  const magicCanvas = useMagicCanvas();

  const props = defineProps<{
    sectionsToHighlight: CircleLabel[][];
  }>();

  const emits = defineEmits<{
    (e: "sections-updated", value: CircleLabel[][]): void;
  }>();

  const circleSectionsToHighlight = computed(() => {
    return props.sectionsToHighlight.filter((section) => {
      return !(section.length === 1 && section[0] === "S");
    });
  });

  const { canvasFocused } = useCanvasFocus(magicCanvas.canvas);

  const circles = ref<Circle[]>([]);
  const getCircleLabel = useLabelGetter(circles);

  const { isResizing } = useCircleResize({
    magicCanvas,
    circles,
  });

  useCircleDrag({
    magicCanvas,
    circles,
    isResizing,
  });

  const entireSetSpaceHighlighted = computed(() => {
    return props.sectionsToHighlight.some((section) => {
      return section.length === 1 && section[0] === "S";
    });
  });

  const canvasColor = computed(() => {
    return entireSetSpaceHighlighted.value
      ? COLORS.HIGHLIGHT
      : COLORS.BACKGROUND;
  });

  const overlaps = useOverlaps(circles);
  const allSections = useAllSections(circles, overlaps);

  magicCanvas.draw.content.value = (ctx) => {
    draw(ctx, circles.value, overlaps.value, circleSectionsToHighlight.value);
  };

  magicCanvas.draw.backgroundPattern.value = (ctx, at, alpha) => {
    cross({
      at,
      size: 14,
      lineWidth: 1,
      fillColor: "#6b7280" + alpha,
    }).draw(ctx);
  };

  watch(allSections, () => {
    emits("sections-updated", allSections.value);
  });

  const createCircle = () => {
    circles.value.push({
      label: getCircleLabel(),
      at: magicCanvas.cursorCoordinates.value,
      radius: 70,
    });
  };
</script>

<style scoped>
  canvas {
    background: v-bind(canvasColor);
  }
</style>
