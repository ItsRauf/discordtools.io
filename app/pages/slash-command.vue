<script setup lang="ts">
import tools from "~/assets/data/tools.json";

const route = useRoute();
const tool = tools.find((t) => t.route === route.path);

useEmbed(tool);

definePageMeta({
  layout: "tool",
});
</script>

<template>
  <UCard variant="outline">
    <template #header>
      <h1 class="text-4xl text-highlighted font-bold">{{ tool?.name }}</h1>
      <p class="text-pretty">{{ tool?.description }}</p>
    </template>
    <SlashBuilder />
  </UCard>
</template>
