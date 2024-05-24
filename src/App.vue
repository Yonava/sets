<script setup lang="ts">
import LatexInput from './components/LatexInput.vue';
import CircleCanvas from './components/CircleCanvas.vue'
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
</script>

<template>
  <div style="">
    <div style="position: absolute; left: 0; top: 0;">
      <CircleCanvas 
        v-model="setSpace"
        :sections-to-highlight="output"
      />
    </div>
    <div style="position: absolute; bottom: 30px; background: white; border-radius: 50px; left: calc(50% - 250px)">
      <LatexInput v-model="latexInputString" />
    </div>
    <!-- <code>
      {{ JSON.stringify(output, null, 2) }}
    </code> -->
  </div>
</template>