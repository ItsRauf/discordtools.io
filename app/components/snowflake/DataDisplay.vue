<script setup lang="ts">
const props = defineProps({
  valid: Boolean,
  title: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
});
</script>

<template>
  <span>
    <h2 class="text-2xl text-highlighted font-bold">
      {{ props.title }}
    </h2>
    <h1 v-if="props.valid" class="text-4xl text-primary font-bold">
      {{ props.value }}
    </h1>
    <USkeleton v-else class="text-4xl h-lh mt-1" />
  </span>
</template>
