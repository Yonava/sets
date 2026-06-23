<script setup lang="ts">
  import LatexInput from "./LatexInput.vue";
  import LatexButton from "./LatexButton.vue";
  import { ref, computed, watch } from "vue";
  import type { CircleLabel, HighlightGroup } from "../types/types";
  import { setParser } from "../other/expressionParser";
  import { parseMathJSON } from "../other/parseMathJSON";
  import { KEY_TO_LATEX, ADDITIONAL_KEY_BINDINGS, COLORS } from "../other/constants";
  import { simplify } from "../other/simplifier";
  import { extractVariables } from "../other/simplifier/truthTable";

  const props = defineProps<{
    allSections: CircleLabel[][];
  }>();

  const emit = defineEmits<{
    "update:activeSubsets": [subsets: HighlightGroup[]];
  }>();

  const latexInputRefs = ref<InstanceType<typeof LatexInput>[]>([]);
  const setInputRef = (el: unknown, index: number) => {
    if (el) latexInputRefs.value[index] = el as InstanceType<typeof LatexInput>;
  };

  const latexInputStrings = ref<{ value: string; hidden: boolean }[]>([{ value: "", hidden: false }]);
  const focusedIndex = ref(0);

  const insertLatexSymbol = (symbol: string) => {
    latexInputRefs.value[focusedIndex.value]?.insertIntoLatexString(symbol);
  };

  const addInput = () => {
    latexInputStrings.value.push({ value: "", hidden: false });
    focusedIndex.value = latexInputStrings.value.length - 1;
  };

  const definedSets = computed(() => [...new Set(props.allSections.flat())]);

  const inputErrors = computed(() => {
    const parse = setParser(props.allSections);
    return latexInputStrings.value.map(({ value }) => {
      if (!value.trim()) return false;
      const mathJSON = parseMathJSON(value);
      if (!mathJSON) return true;
      if (parse(mathJSON.json) === null) return true;
      if (definedSets.value.length > 0) {
        const vars = extractVariables(mathJSON.json);
        if (vars.some(v => !definedSets.value.includes(v))) return true;
      }
      return false;
    });
  });

  const simplifiedForms = computed(() =>
    latexInputStrings.value.map(({ value }) => simplify(value, definedSets.value))
  );

  const applySimplification = (index: number) => {
    const simplified = simplifiedForms.value[index];
    if (!simplified) return;
    latexInputStrings.value[index].value = simplified;
    latexInputRefs.value[index]?.replaceLatexString(simplified);
  };

  const activeSubsets = computed(() => {
    const parse = setParser(props.allSections);
    const results: HighlightGroup[] = [];
    for (const [index, inputString] of latexInputStrings.value.entries()) {
      if (inputString.hidden) continue;
      const mathJSON = parseMathJSON(inputString.value);
      const sections = mathJSON && parse(mathJSON.json);
      if (sections) results.push({ sections, color: COLORS.HIGHLIGHT[index % COLORS.HIGHLIGHT.length] });
    }
    return results;
  });

  watch(activeSubsets, (val) => emit("update:activeSubsets", val), { immediate: true });
</script>

<template>
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
          v-model="latexInputStrings[index].value"
          :hotkeys="{ ...KEY_TO_LATEX, ...ADDITIONAL_KEY_BINDINGS }"
          :ref="(el) => setInputRef(el, index)"
          :class="['flex-1 rounded-md min-w-0', inputErrors[index] ? 'bg-red-50 ring-2 ring-red-400' : 'bg-white']"
          @focus="focusedIndex = index"
        />
        <button
          v-if="simplifiedForms[index] && !inputErrors[index]"
          @click="applySimplification(index)"
          title="Simplify expression"
          class="text-white text-xs px-2 h-8 rounded-md flex-none bg-gray-500 hover:bg-gray-400 whitespace-nowrap"
        >simplify</button>
        <button
          @click="latexInputStrings[index].hidden = !latexInputStrings[index].hidden"
          :style="{ backgroundColor: latexInputStrings[index].hidden ? 'gray' : COLORS.HIGHLIGHT[index % COLORS.HIGHLIGHT.length] }"
          class="w-2 h-8 rounded-full flex-none"
        ></button>
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
