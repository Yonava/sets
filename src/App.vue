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
  import type { Token } from "./sets/types/types";

  const latexInputRef = ref<InstanceType<typeof LatexInput> | null>(null)

  const tokens = ref<Token[]>([]);

  const allSections = ref<CircleLabel[][]>([]);

  const latexMap: Record<Token, string> = {
    cup: '\\cup ',
    cap: '\\cap ',
    delta: '\\Delta ',
    omega: '\\Omega ',
    S: 'S',
    'sup-c': '^c',
  }

  const latexInputString = computed(() =>
    tokens.value.map(t => latexMap[t]).join("")
  )

  const output = computed(() => {
    const expr = setLatexToExpression(latexInputString.value);
    const parse = setParser(allSections.value);
    try {
      return parse(expr);
    } catch (e) {
      return [];
    }
  });

  const hotkeys: Record<string, Token> = {
    i: "cap",
    u: "cup",
    d: "delta",
    o: "omega",
    s: "S",
    c: "sup-c",
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
        ref="latexInputRef"
        v-model="tokens"
        :hotkeys="hotkeys"
        class="w-full rounded-md bg-white"
      />

      <LatexButton
        v-for="(token, key) in hotkeys"
        :key="key"
        @click="latexInputRef?.insertAtCursor(token)"
        :label="token"
        class="bg-gray-900 text-white p-2 rounded-md w-10 h-10 mr-2 mt-2"
      />
    </div>
  </div>
</template>
