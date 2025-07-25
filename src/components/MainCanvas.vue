<template>
  <MagicCanvas
    v-bind="magic.ref"
    @dblclick="createCircle"
  />
</template>

<script setup lang="ts">
  import { computed, ref, watch } from "vue";
  import type { Circle, CircleDisplayName } from "../types/types";
  import { drawCircles } from "../composables/useRenderCanvas";
  import { highlightColor, backgroundColor } from "../utils/constants";
  import MagicCanvas from "@/canvas/MagicCanvas.vue";
  import { useMagicCanvas } from "@/canvas";
  import { useAllSections, useCanvasFocus } from "./extras";
  import { useLabelGetter } from "./useLabel";

  const magic = useMagicCanvas();

  const props = defineProps<{
    sectionsToHighlight: CircleDisplayName[][];
  }>();

  const emits = defineEmits<{
    (e: "sections-updated", value: CircleDisplayName[][]): void;
  }>();

  const { canvasFocused } = useCanvasFocus(magic.canvas);

  const circles = ref<Circle[]>([]);
  const getCircleLabel = useLabelGetter(circles);

  magic.draw.content.value = (ctx) => {
    drawCircles(ctx, circles.value, props.sectionsToHighlight);
  };

  const entireSetSpaceHighlighted = computed(() => {
    return props.sectionsToHighlight.some((section) => {
      return section.length === 1 && section[0] === "S";
    });
  });

  const canvasColor = computed(() => {
    return entireSetSpaceHighlighted.value ? highlightColor : backgroundColor;
  });

  // const allSections = useAllSections(circles, overlaps);

  // watch(allSections, () => {
  //   emits("sections-updated", allSections.value);
  // });

  const createCircle = () => {
    const { x, y } = magic.cursorCoordinates.value;
    circles.value.push({
      id: getCircleLabel(),
      x,
      y,
      radius: 70,
      color: backgroundColor,
    });
  };
</script>

<style scoped>
  canvas {
    background: v-bind(canvasColor);
  }
</style>
