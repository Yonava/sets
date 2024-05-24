<script setup lang="ts">
import LatexInput from './components/LatexInput.vue';
import { setLatexToExpression, setParser } from './expressionParser';
import { ref, computed } from 'vue';

const latexInputString = ref('');

const setSpace = [
  ['A'],
  ['A', 'B'],
  ['B'],
  ['C'],
  ['B', 'C']
];

const output = computed(() => {
  const expr = setLatexToExpression(latexInputString.value);
  const parse = setParser(setSpace);

  try {
    return parse(expr);
  } catch (e) {
    return 'Could Not Parse'
  }
});
</script>

<template>
  <div>
    <LatexInput
      v-model="latexInputString"
      :transform="(c: string) => c.toUpperCase()"
      :hotkeys="{
        'i': '\\cap',
        'u': '\\cup',
        'd': '\\Delta',
      }"
    />
  </div>
  <span>
    {{ latexInputString }}
  </span>
  <code>
    {{ JSON.stringify(output, null, 2) }}
  </code>
</template>