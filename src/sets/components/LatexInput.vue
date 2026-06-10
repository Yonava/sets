<script setup lang="ts">
import "mathlive";
import { ref, onMounted, watch, onUnmounted } from "vue";
import type { MathfieldElement } from "mathlive";

const props = defineProps<{
  hotkeys: Record<string, string>;
}>();

const latexString = defineModel<string>({
  required: true,
});

const latexInput = ref<MathfieldElement | null>(null);

const onInput = () => {
  latexString.value = latexInput.value!.getValue();
};

const onKeydown = (event: Event) => {
  const keyEvent = event as KeyboardEvent;

  if (keyEvent.ctrlKey || keyEvent.metaKey || keyEvent.altKey) {
    return;
  }

  if (keyEvent.key.length !== 1) {
    return;
  }

  const hotkeyLatex = props.hotkeys[keyEvent.key];

  if (hotkeyLatex) {
    keyEvent.preventDefault();
    latexInput.value!.executeCommand(["insert", hotkeyLatex]);
    return;
  }

  if (!(keyEvent.key in props.hotkeys) && /^[a-zA-Z]$/.test(keyEvent.key)) {
    keyEvent.preventDefault();
    latexInput.value!.executeCommand(["insert", keyEvent.key.toUpperCase()]);
  }
};

onMounted(() => {
  const mathField = latexInput.value;

  if (!mathField) return;

  mathField.addEventListener("input", onInput);
  mathField.setValue(latexString.value);

  watch(latexString, (val) => {
    if (mathField.getValue() !== val) mathField.setValue(val);
  });

  mathField.addEventListener("keydown", onKeydown);
});

onUnmounted(() => {
  const mathField = latexInput.value;

  if (!mathField) return;

  mathField.removeEventListener("input", onInput);
  mathField.removeEventListener("keydown", onKeydown);
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

math-field {
  height: 2em;
}
</style>