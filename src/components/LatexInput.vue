<script setup lang="ts">
import katex from 'katex';
import { ref, watch, onMounted } from 'vue';
import { backspace } from '@/utils/latexInputBackspace';

const props = defineProps<{
  hotkeys: Record<string, string>;
  transform: (c: string) => string;
}>();

const latexString = defineModel<string>({ required: true });

const latexInput = ref<HTMLDivElement | null>(null);
const renderError = ref('');

onMounted(() => {
  if (!latexInput.value) return;

  latexInput.value.addEventListener('keydown', inputKeyPressHandler);

  latexInput.value.addEventListener('copy', (event) => {
    event.preventDefault();
    latexString.value = latexString.value.slice(0, -1);
    navigator.clipboard.writeText(latexString.value);
  });

  latexInput.value.addEventListener('paste', async (event) => {
    event.preventDefault();
    latexString.value = latexString.value.slice(0, -1);
    const t = await navigator.clipboard.readText();
    latexString.value += t;
  });

  latexInput.value.addEventListener('cut', (event) => {
    event.preventDefault();
    latexString.value = latexString.value.slice(0, -1);
    navigator.clipboard.writeText(latexString.value);
  });

});


const inputKeyPressHandler = (event: KeyboardEvent) => {
  event.preventDefault();

  if (event.key === 'Backspace') {
    return latexString.value = backspace(latexString.value);
  }

  if (event.key.length > 1) {
    return;
  }

  // hotkeys tied to latex commands
  if (props.hotkeys[event.key]) {
    latexString.value += props.hotkeys[event.key];
    return;
  }

  latexString.value += props.transform(event.key);
}

const renderLatexInInput = () => {
  try {
    katex.render(latexString.value, latexInput.value);
    renderError.value = '';
  } catch (e) {
    renderError.value = 'Invalid LaTeX';
  }
}

const setLatexInputFocus = (state: boolean) => {
  if (!latexInput.value) return;

  if (state) {
    latexInput.value.classList.add('input-field');
    latexInput.value.classList.remove('input-field-inactive');
    latexInput.value.focus();
  } else {
    latexInput.value.classList.remove('input-field');
    latexInput.value.classList.add('input-field-inactive');
  }
}

watch(latexString, (newStr, oldStr) => {
  renderLatexInInput();
  if (newStr.length > oldStr.length) {
    setLatexInputFocus(true);
  }
});
</script>

<template>
  <div
    tabindex="0"
    class="input-field-inactive text-box"
    @focus="setLatexInputFocus(true)"
    @blur="setLatexInputFocus(false)"
    ref="latexInput"
  ></div>
</template>

<style scoped>
@keyframes cursor {
  0% {
    opacity: 0;
  }
  1% {
    opacity: 1;
  }
  50% {
    opacity: 1;
  }
  51% {
    opacity: 0;
  }
  100% {
    opacity: 0;
  }
}

.text-box {
  height: 30px;
  padding: 3px;
  padding-left: 10px;
  cursor: text;
}

.input-field:focus {
  outline: none;
}

.input-field-inactive {
  /* add inactive styles */
}

.input-field::after {
  content: '';
  position: absolute;
  width: 1px;
  height: 20px;
  background-color: black;
  margin-left: 1px;
  animation: cursor 1s infinite;
}
</style>