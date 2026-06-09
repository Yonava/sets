<template>
  <span class="cursor" />
</template>

<style scoped>
.cursor {
  display: inline-block;
  width: 2px;
  height: 1.1em;
  background: #4f46e5;
  margin: 0 1px;
  vertical-align: middle;
  animation: blink 1s step-end infinite;
}

@keyframes blink {
  50% { opacity: 0; }
}
</style>
