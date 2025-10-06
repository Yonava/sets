<script setup lang="ts">
  import { onBeforeUnmount, onMounted, ref } from "vue";
  import type { MagicCanvasProps } from "./types";

  const props = defineProps<MagicCanvasProps["ref"]>();

  const canvas = ref<HTMLCanvasElement>();

  onMounted(() => {
    if (!canvas.value)
      throw new Error("Canvas not found in DOM. Check ref link.");
    props.canvasRef(canvas.value);
  });

  onBeforeUnmount(() => {
    if (!canvas.value)
      throw new Error("Canvas not found in DOM. Check ref link.");
    props.cleanup(canvas.value);
  });
</script>

<template>
  <canvas
    ref="canvas"
    style="width: 100vw; height: 100vh; display: block"
  ></canvas>
</template>
