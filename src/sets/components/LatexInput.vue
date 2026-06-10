<script setup lang="ts">
import "mathlive";
import { ref, onMounted } from "vue";
import type { MathfieldElement } from "mathlive";

const props = defineProps<{
  hotkeys: Record<string, string>;
  transform: (c: string) => string;
}>();

const latexString = defineModel<string>({
  required: true,
});

const latexInput = ref<MathfieldElement | null>(null);

onMounted(() => {
  const mf = latexInput.value;

  if (!mf) return;

  mf.addEventListener("input", () => {
    latexString.value = mf.getValue();
  });

  mf.setValue(latexString.value);

  mf.addEventListener("keydown", (event) => {

    if (
      event.ctrlKey ||
      event.metaKey ||
      event.altKey
    ) {
      return;
    }

    const latex = props.hotkeys[event.key];

    if (event.key.length !== 1) {
    return;
  }

  event.preventDefault();

  if (!(event.key in props.hotkeys)) {
    mf.executeCommand([
    "insert",
    event.key.toUpperCase()
  ]);
  }

    if (latex) {
      event.preventDefault();

      mf.executeCommand([
        "insert",
        latex
      ]);

      return;
    }
  });
});
</script>

<template>
   <math-field
    ref="latexInput"
    class="text-box"
  />
</template>