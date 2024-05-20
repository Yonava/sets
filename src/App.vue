<script setup lang="ts">
import 'katex/dist/katex.min.css';
import { ref } from 'vue';
import katex from 'katex';

const tex = ref(null);

const text = ref('')

const inputActive = ref(false);

const error = ref('');

const fn = () => {
  try {
    katex.render(text.value, tex.value);
    error.value = '';
  } catch (e) {
    error.value = 'Invalid LaTeX';
  }
}

document.addEventListener('keydown', (event) => {
  if (!inputActive.value) {
    return;
  }
  if (event.key === 'Backspace') {

    const selectedText = window.getSelection()!.toString();

    if (selectedText) {
      text.value = text.value.replace(selectedText, '');
      fn();
      return;
    }

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

  if (event.key.length > 1) {
    return;
  }

  if (event.key === 'i') {
    text.value += ' \\cap ';
  } else if (event.key === 'u') {
    text.value += ' \\cup ';
  } else if (event.key === 'd') {
    text.value += ' \\Delta ';
  } else {
    text.value += event.key.toUpperCase();
  }

  event.preventDefault();
  fn();
});

const setInputFocus = (state: boolean) => {
  inputActive.value = state;
  if (state) {
    tex.value.classList.add('input-field');
    tex.value.classList.remove('input-field-inactive');
  } else {
    tex.value.classList.remove('input-field');
    tex.value.classList.add('input-field-inactive');
  }
}
</script>

<template>
  <div
    tabindex="0"
    class="input-field-inactive"
    @focus="setInputFocus(true)"
    @blur="setInputFocus(false)"
    ref="tex"
    style="border: 1px solid black; width: 500px; height: 24px; border-radius: 50px; padding: 3px; padding-left: 10px;"
  >

  </div>
  <div>
    <span>
      {{ error }}
    </span>
  </div>
  <!-- <div
    :style="{
      width: 400 + 'px',
      height: 20 + 'px',
    }"

  >
    {{ text }}
  </div> -->
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