<script setup lang="ts">
import 'katex/dist/katex.min.css';
import { ref, onMounted } from 'vue';
import katex from 'katex';

const tex = ref(null);

const text = ref('')

const error = ref('');

const fn = () => {
  try {
    katex.render(text.value, tex.value);
    error.value = '';
  } catch (e) {
    error.value = 'Invalid LaTeX';
  }
}

const isAlphaNumeric = (key: string) => {
  return /^[a-zA-Z0-9]$/.test(key);
}

document.addEventListener('keydown', (event) => {
  console.log(event.key)
  if (event.key === 'Backspace') {
    const lastChar = text.value.slice(-1);
    text.value = text.value.slice(0, -1);
    // if we return a space, find the index of the last "\" and remove everything after it
    if (lastChar === ' ') {
      const lastSlash = text.value.lastIndexOf('\\');
      text.value = text.value.slice(0, lastSlash - 1);
    }
    fn();
    return;
  }

  if (!isAlphaNumeric(event.key)) {
    return;
  }

  if (event.key === 'i') {
    text.value += ' \\cap ';
  } else if (event.key === 'u') {
    text.value += ' \\cup ';
  } else {
    text.value += event.key.toUpperCase();
  }

  event.preventDefault();
  fn();
});
</script>

<template>
  <div
    ref="tex"
    style="border: 2px solid black; width: 400px; height: 400px;"
  >
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
    {{ text }}
  </div>
</template>

<style>
canvas {
  border: 5px solid black;
}
</style>