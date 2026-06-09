<script setup lang="ts">
import { ref } from "vue";
import Cursor from "./latexTextBox/Cursor.vue";
import MathToken from "./latexTextBox/MathToken.vue";
import type { Token } from "@/sets/types/types";

const props = defineProps<{
  hotkeys: Record<string, Token>
}>()

const tokens = defineModel<Token[]>({ required: true })
const cursor = ref(0)

const insertAtCursor = (token: Token) => {
  tokens.value.splice(cursor.value, 0, token)
  cursor.value++
}

const onKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'ArrowLeft') {
    cursor.value = Math.max(0, cursor.value - 1)
    e.preventDefault()
    return
  }
  if (e.key === 'ArrowRight') {
    cursor.value = Math.min(tokens.value.length, cursor.value + 1)
    e.preventDefault()
    return
  }
  if (e.key === 'Backspace') {
    if (cursor.value > 0) {
      tokens.value.splice(cursor.value - 1, 1)
      cursor.value--
    }
    e.preventDefault()
    return
  }
  const token = props.hotkeys[e.key.toLowerCase()]
  if (token) {
    insertAtCursor(token)
    e.preventDefault()
  }
}

defineExpose({ insertAtCursor })
</script>

<template>
  <div
    class="text-box"
    tabindex="0"
    @keydown="onKeyDown"
  >
    <Cursor v-if="cursor === 0" />

    <template
      v-for="(token, i) in tokens"
      :key="i"
    >
      <MathToken :token="token" />
      <Cursor v-if="cursor === i + 1" />
    </template>
  </div>
</template>

<style scoped>
.text-box {
  min-height: 38px;
  padding: 6px 12px;
  cursor: text;
  border: 1px solid #ccc;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  background: white;
}

.text-box:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2);
}
</style>
