<script setup lang="ts">
  import LatexInput from "./sets/components/LatexInput.vue";
  import MainCanvas from "./sets/components/MainCanvas.vue";
  import LatexButton from "./sets/components/LatexButton.vue";
  import { setParser } from "./sets/other/expressionParser";
  import { ref, computed } from "vue";
  import type { CircleLabel , HighlightGroup} from "./sets/types/types";
  import { parseMathJSON } from "./sets/other/parseMathJSON";
  import { KEY_TO_LATEX, ADDITIONAL_KEY_BINDINGS, COLORS } from "./sets/other/constants";

  const latexInputRefs = ref<InstanceType<typeof LatexInput>[]>([]);
  const setInputRef = (el: unknown, index: number) => {
    if (el) latexInputRefs.value[index] = el as InstanceType<typeof LatexInput>;
  };

  const latexInputStrings = ref<string[]>([""]);
  const focusedIndex = ref(0);

  const insertLatexSymbol = (symbol: string) => {
    latexInputRefs.value[focusedIndex.value]?.insertIntoLatexString(symbol);
  };

  const addInput = () => {
    latexInputStrings.value.push("");
    focusedIndex.value = latexInputStrings.value.length - 1;
  };

  const allSections = ref<CircleLabel[][]>([]);
  
  const activeSubsets = computed(() => {
    const parse = setParser(allSections.value);
    const results: HighlightGroup[] = [];
    for (const value of latexInputStrings.value) {
      const mathJSON = parseMathJSON(value);
      if (!mathJSON) continue;
      try {
        results.push({ sections: parse(mathJSON.json), color: COLORS.HIGHLIGHT[results.length % COLORS.HIGHLIGHT.length] });
      } catch (e) {
      }
    }
    return results;
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
      <div
        v-for="(_, index) in latexInputStrings"
        class="flex items-center gap-2 mb-2"
      >
        <LatexInput
          :key="index"
          v-model="latexInputStrings[index]"
          :hotkeys="{ ...KEY_TO_LATEX, ...ADDITIONAL_KEY_BINDINGS }"
          :ref="(el) => setInputRef(el, index)"
          class="flex-1 rounded-md bg-white min-w-0"
          @focus="focusedIndex = index"
        />

        <div
          :style="{ backgroundColor: COLORS.HIGHLIGHT[index % COLORS.HIGHLIGHT.length] }"
          class="w-2 h-8 rounded-full flex-none"
        ></div>
      </div>

      <button
        @click="addInput"
        :disabled="latexInputStrings.length > 5"
        class="text-white text-sm mb-2 opacity-60 hover:opacity-100"
      >+ add expression</button>
      <div class="flex">
        <LatexButton
          v-for="key in KEY_TO_LATEX"
          @click="insertLatexSymbol(key)"
          :label="key"
          class="bg-gray-900 text-white p-2 rounded-md w-10 h-10 mr-2 mt-2"
        />
      </div>
    </div>
  </div>
</template>