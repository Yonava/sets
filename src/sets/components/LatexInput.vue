<script setup lang="ts">
import { onMounted } from 'vue';
import { ref } from 'vue';
import MathField from './MathField.vue';

  const content = ref('')

  const addCap = () => {
    content.value += '\\cap'
  }

  onMounted(() => {
      addCap()
  })
</script>

<template>
  <MathField style="width: full; height: full;" />
</template>