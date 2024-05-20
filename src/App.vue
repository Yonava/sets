<script setup lang="ts">
import 'katex/dist/katex.min.css';
import { ref, onMounted, watch } from 'vue';
import katex from 'katex';

const tex = ref<HTMLDivElement | null>(null);
const cursorTex = ref<HTMLDivElement | null>(null);

const text = ref('')
const error = ref('');

const cursorPosition = ref(0);

const fn = () => {
  try {
    katex.render(text.value, tex.value);
    katex.render(text.value.slice(0, cursorPosition.value), cursorTex.value);
    error.value = '';
  } catch (e) {
    error.value = 'Invalid LaTeX';
  }
}

onMounted(() => {
  if (!tex.value) {
    return;
  }

  tex.value.addEventListener('keydown', inputKeyPressHandler);

  tex.value.addEventListener('copy', (event) => {
    event.preventDefault();
    text.value = text.value.slice(0, -1);
    navigator.clipboard.writeText(text.value);
  });

  tex.value.addEventListener('paste', async (event) => {
    event.preventDefault();
    text.value = text.value.slice(0, -1);
    const t = await navigator.clipboard.readText();
    text.value += t;
  });

  tex.value.addEventListener('cut', (event) => {
    event.preventDefault();
    text.value = text.value.slice(0, -1);
    navigator.clipboard.writeText(text.value);
  });

});

const inputKeyPressHandler = (event: KeyboardEvent) => {
  event.preventDefault();

  if (event.key === 'ArrowLeft') {
    console.log(text.value[cursorPosition.value - 1])
    cursorPosition.value = Math.max(0, cursorPosition.value - 1);
    fn();
    return;
  }

  if (event.key === 'ArrowRight') {
    cursorPosition.value = Math.min(text.value.length, cursorPosition.value + 1);
    fn();
    return;
  }

  if (event.key === 'Backspace') {

    const selectedText = window.getSelection()!.toString();

    if (selectedText) {
      text.value = text.value.replace(selectedText, '');
      return;
    }

    const lastChar = text.value.slice(-1);
    const stringMinusLastChar = text.value.slice(0, -1);

    // if the char we are removing is a space, it means we hit a latex command
    if (lastChar === ' ') {
      const lastSlash = stringMinusLastChar.lastIndexOf('\\');
      text.value = text.value.slice(0, lastSlash)
    } else {
      text.value = stringMinusLastChar;
    }

    // if (lastChar === ' ') {
    //   const lastSlash = text.value.lastIndexOf('\\');
    //   text.value = text.value.slice(0, lastSlash).trim();
    // }

    return;
  }

  if (event.key.length > 1) {
    return;
  }

  if (event.key === 'i') {
    text.value += '\\cap ';
    cursorPosition.value += 5;
  } else if (event.key === 'u') {
    text.value += '\\cup ';
    cursorPosition.value += 5;
  } else if (event.key === 'd') {
    text.value += '\\Delta ';
    cursorPosition.value += 7;
  } else {
    text.value += event.key.toUpperCase();
    cursorPosition.value += 1;
  }

  fn();
}

const setInputFocus = (state: boolean) => {
  if (!tex.value) return;

  if (!cursorTex.value) return;

  if (state) {
    // tex.value.classList.add('input-field');
    tex.value.classList.remove('input-field-inactive');

    cursorTex.value.classList.add('input-field');
    cursorTex.value.classList.remove('input-field-inactive');
  } else {
    tex.value.classList.remove('input-field');
    tex.value.classList.add('input-field-inactive');

    cursorTex.value.classList.remove('input-field');
    cursorTex.value.classList.add('input-field-inactive');
  }
}

watch(text, fn);
</script>

<template>
  <div style="position: relative">
    <div
      tabindex="0"
      class="input-field-inactive text-box"
      @focus="setInputFocus(true)"
      @blur="setInputFocus(false)"
      ref="tex"
    ></div>

    <div
      style="position: absolute; top: 0; left: 0; z-index: 1; pointer-events: none;"
      class="input-field-inactive text-box"
      ref="cursorTex"
    ></div>
  </div>

  <div>
    <span>
      {{ error }}
    </span>
  </div>
  <div
    :style="{
      width: 400 + 'px',
      height: 20 + 'px',
    }"

  >
    "{{ text }}"
  </div>
</template>

<style>
canvas {
  border: 5px solid black;
}

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
  border-radius: 50px;
  padding: 3px;
  padding-left: 10px;
  cursor: text;
}

.input-field:focus {
  outline: none;
}

.input-field-inactive {
  background: rgb(233, 233, 233);
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