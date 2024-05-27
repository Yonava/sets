<script setup lang="ts">
import LatexInput from './components/LatexInput.vue';
import CircleCanvas from './components/CircleCanvas.vue'
import LatexButton from './components/LatexButton.vue';
import { setLatexToExpression, setParser } from './expressionParser';
import { ref, computed } from 'vue';

const latexInputString = ref('');

const setSpace = ref([])

const output = computed(() => {
  const expr = setLatexToExpression(latexInputString.value);
  const parse = setParser(setSpace.value);
  try {
    return parse(expr);
  } catch (e) {
    // return 'Could Not Parse'
    return []
  }
});

const hotkeys = {
  'i': '\\cap ',
  'u': '\\cup ',
  'd': '\\Delta ',
  'c': '^c',
  'o': '\\Omega '
};

const t = (c: string) => ' ' + c.toUpperCase();
</script>

<template>
  <div style="position: absolute; left: 0; top: 0;">
    <CircleCanvas
      v-model="setSpace"
      :sections-to-highlight="output"
    />
  </div>
  <div style="position: absolute; top: 0; left: 0; z-index: 2; background: white;">
    <LatexInput
      v-model="latexInputString"
      :transform="t"
      :hotkeys="hotkeys"
    />
  </div>

  <!-- <LatexButton
    v-for="command in hotkeys"
    @click="latexInputString += command + ' '"
    :label="command"
  /> -->
</template>