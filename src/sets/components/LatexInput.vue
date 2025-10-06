<script setup lang="ts">
import { onMounted } from 'vue';
import { ref } from 'vue';

  const id = 'math-element-to-grab';

  const test = ref<HTMLElement | null>(null)


  onMounted(() => {
    test.value = document.getElementById(id)
    console.log(test.value)
  })
</script>

<template>
  <math-field :id="id">x=\frac{-b\pm \sqrt{b^2-4ac}}{2a}</math-field>
</template>

<style scoped>
math-field::part(virtual-keyboard-toggle), math-field::part(menu-toggle) {
  display: none;
}
</style>