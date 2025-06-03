<script setup lang="ts">
import { GuildFeature } from "discord-api-types/v10"
import tools from "~/assets/data/tools.json"

const route = useRoute();
const tool = tools.find(t => t.route === route.path);

useEmbed(tool)

definePageMeta({
  layout: "authed-tool",
  middleware: "client-auth"
});

const { data: auth } = useAuth();

const headers = useRequestHeaders(['cookie']) as HeadersInit
const { data: guilds } = useFetch("/api/@me/guilds", { headers, key: auth.value?.user?.name ?? "" })

const dataset = computed(() => ({
  "You Own": guilds.value?.filter(g => g.owner),
  "You Moderate": guilds.value?.filter(g => +g.permissions & (1 << 13) && !g.owner),
  "Community Enabled": guilds.value?.filter(g => g.features.includes(GuildFeature.Community)),
  "Discovery Enabled": guilds.value?.filter(g => g.features.includes(GuildFeature.Discoverable)),
  "Partnered": guilds.value?.filter(g => g.features.includes(GuildFeature.Partnered)),
  "Verified": guilds.value?.filter(g => g.features.includes(GuildFeature.Verified)),
}))
</script>

<template>
  <UCard variant="outline">
    <template #header>
      <h1 class="text-4xl text-highlighted font-bold">{{ tool?.name }}</h1>
      <p class="text-pretty">{{ tool?.description }}</p>
    </template>
    <UCard variant="soft">
      <template #header>
        <h1 class="w-full text-4xl text-highlighted font-bold text-center flex items-center justify-center gap-2">
          You are in
          <span
            v-if="guilds"
            class="text-primary font-bold underline"
          >{{ guilds.length }}</span>
          <USkeleton
            v-else
            class="inline-block w-[3ch] h-lh"
          />
          servers
        </h1>
      </template>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <UModal
          v-for="(value, key) in dataset"
          :key="key"
          :ui="{
            body: 'flex flex-col gap-2'
          }"
        >
          <UCard
            variant="outline"
            :ui="{
              body: 'flex items-center justify-center'
            }"
          >
            <template #header>
              <h2 class="text-2xl text-primary font-bold text-center">{{ key }}</h2>
            </template>
            <h1
              v-if="value"
              class="text-4xl text-highlighted font-bold text-center"
            >
              {{ value.length }}
            </h1>
            <USkeleton
              v-else
              class="text-4xl inline-block w-[3ch] h-lh mx-auto"
            />
          </UCard>
          <template #title>
            {{ key }}
          </template>
          <template #body>
            <div
              v-for="guild of value"
              :key="guild.id"
              class="flex items-center gap-2"
            >
              <UAvatar
                :src="`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`"
                :alt="guild.name[0]"
                size="xs"
              />
              <p class="text-pretty">{{ guild.name }}</p>
            </div>
          </template>
        </UModal>
        <UModal
          class="col-span-full flex items-center justify-center"
          :ui="{
            body: 'flex flex-col gap-2'
          }"
        >
          <div>
            <UButton
              size="lg"
              variant="soft"
            >
              <h2 class="text-xl text-primary font-bold">Show All</h2>
            </UButton>
          </div>
          <template #title>
            All Servers
          </template>
          <template #body>
            <div
              v-for="guild of guilds"
              :key="guild.id"
              class="flex gap-2 items-center"
            >
              <UAvatar
                :src="`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`"
                :alt="guild.name[0]"
                size="xs"
              />
              <p class="text-pretty">{{ guild.name }}</p>
              <UTooltip
                :content="{ side: 'top' }"
                text="Owner"
              >
                <UIcon
                  v-if="dataset['You Own']?.includes(guild)"
                  name="ph:crown-simple-fill"
                  class="text-warning"
                />
              </UTooltip>
              <UTooltip
                :content="{ side: 'top' }"
                text="Moderator"
              >
                <UIcon
                  v-if="dataset['You Moderate']?.includes(guild)"
                  name="ph:shield-star-fill"
                  class="text-primary"
                />
              </UTooltip>
            </div>
          </template>
        </UModal>
      </div>
    </UCard>
  </UCard>
</template>
