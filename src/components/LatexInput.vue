<script setup lang="ts">
import katex from 'katex';
import { ref, watch, onMounted } from 'vue';

const props = defineProps<{
  hotkeys: Record<string, string>;
  transform?: (c: string) => string;
}>();

const latexString = defineModel<string>({ required: true });

const latexInput = ref<HTMLDivElement | null>(null);

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

  renderLatexInInput(latexString.value, '');
});


const inputKeyPressHandler = (event: KeyboardEvent) => {
  event.preventDefault();

  if (event.key === 'Backspace') {

    const selectedText = window.getSelection()!.toString();

    if (selectedText) {
      latexString.value = latexString.value.replace(selectedText, '');
      return;
    }

    const specialChars = ['\\', '^', ' ', '_'];
    const indexToSlice = specialChars.reduce((acc, char) => {
      const index = latexString.value.slice(0, -1).lastIndexOf(char);
      return index > acc ? index : acc;
    }, 0);

    latexString.value = latexString.value.slice(0, indexToSlice);

    return;
  }

  if (event.key.length > 1) {
    return;
  }

  if (props.hotkeys[event.key]) {
    latexString.value += props.hotkeys[event.key];
    return;
  }

  latexString.value += props?.transform(event.key) || event.key;
}

const renderLatexInInput = (newStr: string, oldStr: string) => {
  try {
    katex.render(newStr, latexInput.value);
  } catch (e) {
    latexString.value = oldStr;
    console.warn(e);
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
  renderLatexInInput(newStr, oldStr);
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
  border: 1px solid black;
  width: 500px;
  height: 24px;
  padding: 3px;
  padding-left: 10px;
  cursor: text;
  background: white;
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