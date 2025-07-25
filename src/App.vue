<script setup lang="ts">
  import LatexInput from "./components/LatexInput.vue";
  import MainCanvas from "./components/MainCanvas.vue";
  import LatexButton from "./components/LatexButton.vue";
  import { setLatexToExpression, setParser } from "./expressionParser";
  import { ref, computed } from "vue";
  import type { CircleLabel } from "./types/types";

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

  const hotkeys = {
    i: "\\cap ",
    u: "\\cup ",
    d: "\\Delta ",
    o: "\\Omega ",
    S: "S",
    c: "^c",
  };

  const t = (c: string) => " " + c.toUpperCase();
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
        :transform="t"
        :hotkeys="hotkeys"
        class="w-full rounded-md bg-white"
      />

      <LatexButton
        v-for="command in hotkeys"
        @click="latexInputString += command + ' '"
        :label="command"
        class="bg-gray-900 text-white p-2 rounded-md w-10 h-10 mr-2 mt-2"
      />
    </div>
  </div>
</template>
