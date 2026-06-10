<script setup lang="ts">
  import LatexInput from "./sets/components/LatexInput.vue";
  import MainCanvas from "./sets/components/MainCanvas.vue";
  import LatexButton from "./sets/components/LatexButton.vue";
  import {
    setLatexToExpression,
    setParser,
  } from "./sets/other/expressionParser";
  import { ref, computed } from "vue";
  import type { CircleLabel } from "./sets/types/types";
  import { ComputeEngine } from '@cortex-js/compute-engine';

  const latexInputString = ref("");

  const allSections = ref<CircleLabel[][]>([]);

  const output = computed(() => {
    const expr = setLatexToExpression(latexInputString.value);
    const parse = setParser(allSections.value);
    try {
      return parse(expr);
    } catch (e) {
      // could not parse
      return [];
    }
  });

const computeEngine = new ComputeEngine();

const latexMathJSON = computed(() => {
  return computeEngine.parse(latexInputString.value);
});

  const hotkeys = {
    i: "\\cap",
    u: "\\cup",
    d: "\\triangle",
    o: "\\Omega",
    S: "S",
    c: "^\\complement",
    '\\': '\\setminus'
  };

</script>

<template>
  <div class="absolute w-screen flex justify-center">
    <div class="bg-gray-900 mt-5 px-5 py-4 rounded-xl">
      <h1 class="font-semibold text-white text-4xl">Set Theory Visualizer</h1>
    </div>
  </div>
  <MainCanvas
    @sections-updated="(newAllSections) => (allSections = newAllSections)"
    :sections-to-highlight="output"
  />
  <div
    style="position: absolute; bottom: 0; z-index: 2"
    class="flex justify-center items-center w-screen"
  >
    <div class="bg-gray-600 p-5 w-[500px] rounded-t-lg">
      <LatexInput
        v-model="latexInputString"
        :hotkeys="hotkeys"
        class="w-full rounded-md bg-white"
      />
{{ latexMathJSON }}
      <LatexButton
        v-for="command in hotkeys"
        @click="latexInputString += command + ' '"
        :label="command"
        class="bg-gray-900 text-white p-2 rounded-md w-10 h-10 mr-2 mt-2"
      />
    </div>
  </div>
</template>