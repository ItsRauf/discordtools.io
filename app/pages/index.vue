<script setup lang="ts">
import tools from "~/assets/data/tools.json";

useEmbed({
  name: "DiscordTools",
  description: "Utilities for power users",
  image: "/embed.png",
});

definePageMeta({
  auth: false,
});
</script>

<template>
  <div
    class="min-h-screen text-default font-sans flex flex-col gap-16 w-11/12 mx-auto"
  >
    <header class="mt-24">
      <UIcon name="ph:pipe-wrench-duotone" class="text-primary size-16" />
      <h1 class="text-4xl text-highlighted font-bold mt-4">DiscordTools</h1>
      <p class="text-pretty">Utilities for Power Users</p>
    </header>
    <main class="grid grid-cols-1 pb-8 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <NuxtLink v-for="tool in tools" :key="tool.name" :to="tool.route">
        <UCard
          variant="subtle"
          :ui="{
            body: 'p-2 sm:p-2',
            footer: 'p-2 sm:p-2 flex-1',
          }"
          class="h-full flex flex-col"
        >
          <div class="relative w-full aspect-[2]">
            <NuxtImg
              provider="cloudflare"
              :src="tool.image"
              loading="eager"
              preload
            />
          </div>
          <template #footer>
            <div
              class="flex flex-col items-star justify-center px-2 py-4 bg-elevated rounded-b-lg h-full"
            >
              <h3 class="text-xl text-highlighted font-bold text-center">
                {{ tool.name }}
              </h3>
              <p class="text-sm text-center text-pretty">
                {{ tool.description }}
              </p>
            </div>
          </template>
        </UCard>
      </NuxtLink>
    </main>
  </div>
</template>
