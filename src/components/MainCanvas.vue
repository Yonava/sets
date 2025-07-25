<template>
  <MagicCanvas
    v-bind="magic.ref"
    @dblclick="createCircle"
  />
</template>

<script setup lang="ts">
  import { computed, ref, watch } from "vue";
  import type { Circle, CircleLabel } from "../types/types";
  import { draw } from "../composables/draw";
  import { COLORS } from "@utils/sets/constants";
  import MagicCanvas from "@canvas/MagicCanvas.vue";
  import { useMagicCanvas } from "@canvas/index";
  import { useLabelGetter } from "./useLabel";
  import { useOverlaps } from "@/composables/useCalculateOverlaps";
  import { useCanvasFocus } from "@/composables/useCanvasFocus";
  import { useAllSections } from "@/composables/useAllSections";
  import { cross } from "@/shapes/shapes/cross";

  const magic = useMagicCanvas();

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

  const { canvasFocused } = useCanvasFocus(magic.canvas);

  const circles = ref<Circle[]>([]);
  const getCircleLabel = useLabelGetter(circles);

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

  magic.draw.content.value = (ctx) => {
    draw(ctx, circles.value, overlaps.value, circleSectionsToHighlight.value);
  };

  magic.draw.backgroundPattern.value = (ctx, at) => {
    cross({
      at,
      size: 14,
      lineWidth: 1,
      fillColor: "white",
    }).draw(ctx);
  };

  watch(allSections, () => {
    emits("sections-updated", allSections.value);
  });

  const createCircle = () => {
    const { x, y } = magic.cursorCoordinates.value;
    circles.value.push({
      label: getCircleLabel(),
      x,
      y,
      radius: 70,
    });
  };
</script>

<style scoped>
  canvas {
    background: v-bind(canvasColor);
  }
</style>
