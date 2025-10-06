<template>
  <div class="flex flex-col" ref="container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, defineProps, defineEmits } from 'vue'

const props = defineProps<{ modelValue?: string }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: string): void }>()

const container = ref<HTMLElement | null>(null)
let field: any = null

onMounted(async () => {
  if (!customElements.get('math-field')) {
    await import('mathlive') // pnpm ESM import
    await customElements.whenDefined('math-field')
  }

  field = document.createElement('math-field')
  field.value = props.modelValue ?? ''
  field.addEventListener('input', (e: any) => emit('update:modelValue', e.target.value))
  container.value!.appendChild(field)
})

watch(() => props.modelValue, v => {
  if (field && field.value !== v) field.value = v
})
</script>

<style>
math-field::part(virtual-keyboard-toggle), math-field::part(menu-toggle) {
  display: none;
}
</style>
