<script setup lang="ts">
import {
  ApplicationCommandOptionType,
  type ApplicationCommandOptionChoice,
} from "~/types/slashCommand";

const props = defineProps<{
  choice: ApplicationCommandOptionChoice;
  optionId: string;
  optionType: ApplicationCommandOptionType;
}>();

const ctx = inject<{
  updateChoice: (optionId: string, choiceId: string, updates: Partial<ApplicationCommandOptionChoice>) => void;
  removeChoice: (optionId: string, choiceId: string) => void;
}>("slashCommand")!;

const isNumeric = computed(
  () =>
    props.optionType === ApplicationCommandOptionType.Integer ||
    props.optionType === ApplicationCommandOptionType.Number,
);

function onValueInput(e: Event) {
  const raw = (e.target as HTMLInputElement).value;
  if (isNumeric.value) {
    const num = Number(raw);
    ctx.updateChoice(props.optionId, props.choice.id, {
      value: isNaN(num) ? raw : num,
    });
  } else {
    ctx.updateChoice(props.optionId, props.choice.id, { value: raw });
  }
}
</script>

<template>
  <div class="flex items-center gap-2 py-1">
    <UIcon
      name="ph:dots-six-vertical"
      class="text-muted cursor-grab choice-drag-handle shrink-0"
    />
    <UInput
      :model-value="choice.name"
      color="neutral"
      variant="subtle"
      size="xs"
      placeholder="Choice name"
      class="flex-1"
      @input="(e: Event) => ctx.updateChoice(optionId, choice.id, { name: (e.target as HTMLInputElement).value })"
    />
    <UInput
      :model-value="String(choice.value)"
      color="neutral"
      variant="subtle"
      size="xs"
      :placeholder="isNumeric ? '0' : 'value'"
      :type="isNumeric ? 'number' : 'text'"
      class="flex-1"
      @input="onValueInput"
    />
    <UButton
      icon="ph:x"
      color="error"
      variant="ghost"
      size="xs"
      @click="ctx.removeChoice(optionId, choice.id)"
    />
  </div>
</template>
