<script setup lang="ts">
import tools from "~/assets/data/tools.json";

const route = useRoute();
const tool = tools.find((t) => t.route === route.path);

useEmbed(tool);

definePageMeta({
  layout: "tool",
});

const builder = useComponentsBuilder();
provide("builder", builder);
</script>

<template>
  <UCard variant="outline">
    <template #header>
      <h1 class="text-4xl text-highlighted font-bold">{{ tool?.name }}</h1>
      <p class="text-pretty">{{ tool?.description }}</p>
    </template>
    <div class="flex flex-col gap-4">
      <div class="flex flex-col lg:flex-row gap-4">
        <Cv2Palette class="lg:w-64 shrink-0" />
        <Cv2Canvas class="flex-1 min-w-0" />
      </div>
      <Cv2JsonOutput />
    </div>
  </UCard>
</template>
