<script setup lang="ts">
import {
  ApplicationCommandOptionType,
  optionTypeLabels,
  optionTypeIcons,
  optionTypeColors,
} from "~/types/slashCommand";

defineProps<{
  disabledTypes: Set<ApplicationCommandOptionType>;
}>();

const open = defineModel<boolean>("open", { default: false });

const emit = defineEmits<{
  select: [type: ApplicationCommandOptionType];
}>();

const optionTypes = Object.values(ApplicationCommandOptionType).filter(
  (v) => typeof v === "number",
) as ApplicationCommandOptionType[];

function select(type: ApplicationCommandOptionType) {
  emit("select", type);
}
</script>

<template>
  <UModal v-model:open="open" title="Add Option" description="Select the option type to add">
    <template #body>
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 py-2">
        <UButton
          v-for="type in optionTypes"
          :key="type"
          variant="soft"
          :color="(optionTypeColors[type] as 'info' | 'success' | 'warning' | 'neutral' | 'primary' | 'error')"
          :disabled="disabledTypes.has(type)"
          class="flex flex-col items-center gap-1 py-3"
          @click="select(type)"
        >
          <UIcon :name="optionTypeIcons[type]" class="size-5" />
          <span class="text-xs font-medium">{{ optionTypeLabels[type] }}</span>
        </UButton>
      </div>
    </template>
  </UModal>
</template>
