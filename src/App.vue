<script setup lang="ts">
  import LatexInput from "./sets/components/LatexInput.vue";
  import MainCanvas from "./sets/components/MainCanvas.vue";
  import LatexButton from "./sets/components/LatexButton.vue";
  import { setParser } from "./sets/other/expressionParser";
  import { ref, computed } from "vue";
  import type { CircleLabel } from "./sets/types/types";
  import { useMathJSON } from "./sets/composables/useMathJSON";
  import { KEY_TO_LATEX } from "./sets/other/constants";


  const latexInputString = ref("");
  const latexInputRef = ref<InstanceType<typeof LatexInput> | null>(null);

  const insertLatexSymbol = (symbol: string) => {
    if (!latexInputRef.value) return;
    latexInputRef.value.insert(symbol);
  };

  const allSections = ref<CircleLabel[][]>([]);

  const mathJSON = useMathJSON(latexInputString);

  const activeSubsets = computed(() => {
    const parse = setParser(allSections.value);
    if (!mathJSON.value) return [];
    try {
      return parse(mathJSON.value.json);
    } catch (e) {
      return [];
    }
  });
</script>

<template>
  <div class="absolute w-screen flex justify-center">
    <div class="bg-gray-900 mt-5 px-5 py-4 rounded-xl">
      <h1 class="font-semibold text-white text-4xl">Set Theory Visualizer</h1>
    </div>
  </div>
  <MainCanvas
    @sections-updated="(newAllSections) => (allSections = newAllSections)"
    :sections-to-highlight="activeSubsets"
  />
  <div
    style="position: absolute; bottom: 0; z-index: 2"
    class="flex justify-center items-center w-screen"
  >
    <div class="bg-gray-600 p-5 w-[500px] rounded-t-lg">
      <LatexInput
        v-model="latexInputString"
        :hotkeys="KEY_TO_LATEX"
        ref="latexInputRef"
        class="w-full rounded-md bg-white"
      />
      <LatexButton
        v-for="key in KEY_TO_LATEX"
        @click="insertLatexSymbol(key)"
        :label="key"
        class="bg-gray-900 text-white p-2 rounded-md w-10 h-10 mr-2 mt-2"
      />
    </div>
  </div>
</template>