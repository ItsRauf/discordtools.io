<script setup lang="ts">
import tools from "~/assets/data/tools.json";
import { DiscordSnowflake } from "@sapphire/snowflake";

const route = useRoute();
const tool = tools.find((t) => t.route === route.path);

useEmbed(tool);

definePageMeta({
  layout: "tool",
});

const snowflake = ref("");
const date = computed(() => {
  return new Date(DiscordSnowflake.timestampFrom(snowflake.value));
});

const isValidSnowflake = computed(() => {
  if (snowflake.value === "") return false;
  if (isNaN(+snowflake.value)) return false;
  if (isNaN(date.value.getTime())) return false;
  return true;
});

const deconstructed = computed(() => {
  return DiscordSnowflake.deconstruct(snowflake.value);
});
</script>

<template>
  <UCard variant="outline">
    <template #header>
      <h1 class="text-4xl text-highlighted font-bold">{{ tool?.name }}</h1>
      <p class="text-pretty">{{ tool?.description }}</p>
    </template>
    <UCard variant="soft">
      <template #header>
        <div class="flex flex-col">
          <UInput
            v-model="snowflake"
            icon="ph:snowflake-duotone"
            color="neutral"
            variant="subtle"
            size="xl"
            placeholder="Snowflake"
          />
        </div>
      </template>
      <UCard>
        <SnowflakeDataDisplay
          :valid="isValidSnowflake"
          :title="Intl.DateTimeFormat().resolvedOptions().timeZone"
          :value="date.toLocaleString()"
        />
        <USeparator class="my-4" />
        <SnowflakeDataDisplay
          :valid="isValidSnowflake"
          :title="
            Intl.DateTimeFormat('en-US', {
              timeZone: 'UTC',
            }).resolvedOptions().timeZone
          "
          :value="date.toLocaleString('en-US', { timeZone: 'UTC' })"
        />
        <USeparator class="my-4" />
        <SnowflakeDataDisplay
          :valid="isValidSnowflake"
          title="ISO8601"
          :value="date.toISOString()"
        />
        <USeparator class="my-4" />
        <SnowflakeDataDisplay
          :valid="isValidSnowflake"
          title="UNIX Seconds"
          :value="Math.floor(date.getTime() / 1000).toString()"
        />
        <details>
          <UButton variant="soft" size="xl" class="mt-8" as="summary">
            Stats for nerds
          </UButton>
          <UCard variant="soft" class="mt-2">
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <UCard>
                <SnowflakeDataDisplay
                  :valid="isValidSnowflake"
                  title="Worker"
                  :value="deconstructed.workerId.toString()"
                />
              </UCard>
              <UCard>
                <SnowflakeDataDisplay
                  :valid="isValidSnowflake"
                  title="Process"
                  :value="deconstructed.processId.toString()"
                />
              </UCard>
              <UCard>
                <SnowflakeDataDisplay
                  :valid="isValidSnowflake"
                  title="Increment"
                  :value="deconstructed.increment.toString()"
                />
              </UCard>
            </div>
          </UCard>
        </details>
      </UCard>
    </UCard>
  </UCard>
</template>
