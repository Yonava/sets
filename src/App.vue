<script setup lang="ts">
import LatexInput from './components/LatexInput.vue';
import LatexButton from './components/LatexButton.vue';
import { setLatexToExpression, setParser } from './expressionParser';
import { ref, computed } from 'vue';

const latexInputString = ref('');

const setSpace = [
  ['A'],
  ['B'],
  ['C'],
  ['A', 'B']
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

const hotkeys = {
  'i': '\\cap',
  'u': '\\cup',
  'd': '\\Delta',
};
</script>

<template>
  <div>
    <LatexInput
      v-model="latexInputString"
      :transform="(c: string) => c.toUpperCase()"
      :hotkeys="hotkeys"
    />
  </div>
  <LatexButton
    v-for="command in hotkeys"
    @click="latexInputString += command + ' '"
    :label="command"
  />
  <code>
    {{ JSON.stringify(output, null, 2) }}
  </code>
</template>