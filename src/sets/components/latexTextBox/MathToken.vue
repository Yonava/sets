<script lang="ts" setup>
import katex from "katex";
import { computed } from "vue";
import type { Token } from "@/sets/types/types";

const props = defineProps<{
  token: Token
  selected?: boolean
}>()

const latexMap: Record<Token, string> = {
  cup: '\\cup',
  cap: '\\cap',
  delta: '\\Delta',
  S: 'S',
  omega: '\\Omega',
  'sup-c': '{}^c'
}

const latex = computed(() =>
  katex.renderToString(latexMap[props.token], { throwOnError: false })
)
</script>

<template>
  <span
    class="token"
    :class="{ selected }"
    v-html="latex"
  />
</template>

<style scoped>
.token {
  padding: 0 2px;
  border-radius: 2px;
  user-select: none;
}
.token.selected {
  background: rgba(79, 70, 229, 0.2);
}
</style>
