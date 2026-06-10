<script setup lang="ts">
import "mathlive";
import { ref, onMounted, watch } from "vue";
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

  // prevents input from losing focus when clicking outside of the input
  mf.addEventListener("blur", () => {
    setTimeout(() => mf.focus(), 0);
  });

  watch(latexString, (val) => {
    if (mf.getValue() !== val) mf.setValue(val);
  });

  mf.addEventListener("keydown", (event) => {

    if (
      event.ctrlKey ||
      event.metaKey ||
      event.altKey
    ) {
      return;
    }

    const latexString = props.hotkeys[event.key];

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

    if (latexString) {
      event.preventDefault();

      mf.executeCommand([
        "insert",
        latexString
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

<style scoped>
@media not (pointer: coarse) {
  math-field::part(virtual-keyboard-toggle) {
    display: none;
  }
}
math-field::part(menu-toggle) {
  display: none;
}

math-field:focus {
  border: none;
  outline: none;
  box-shadow: none;
}
</style>