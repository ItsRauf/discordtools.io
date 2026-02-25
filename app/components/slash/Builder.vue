<script setup lang="ts">
import { VueDraggable } from "vue-draggable-plus";
import { ApplicationCommandOptionType, optionTypeLabels, type ApplicationCommandOption } from "~/types/slashCommand";

const {
  command,
  addOption,
  updateOption,
  removeOption,
  reorderOptions,
  addChoice,
  updateChoice,
  removeChoice,
  getCleanJSON,
  getDiscordJSCode,
  getDiscordPyCode,
} = useSlashCommand();

provide("slashCommand", {
  addOption,
  updateOption,
  removeOption,
  reorderOptions,
  addChoice,
  updateChoice,
  removeChoice,
});

const showAddModal = ref(false);

const nameRegex = /^[-_\p{L}\p{N}\p{sc=Deva}\p{sc=Thai}]{1,32}$/u;

const nameError = computed(() => {
  if (!command.value.name) return undefined;
  if (command.value.name !== command.value.name.toLowerCase())
    return "Must be lowercase";
  if (command.value.name.includes(" ")) return "No spaces allowed";
  if (!nameRegex.test(command.value.name)) return "Invalid characters";
  if (command.value.name.length > 32) return "Max 32 characters";
  return undefined;
});

const descError = computed(() => {
  if (!command.value.description) return undefined;
  if (command.value.description.length > 100) return "Max 100 characters";
  return undefined;
});

function onNameInput(e: Event) {
  const target = e.target as HTMLInputElement;
  command.value.name = target.value.toLowerCase().replace(/\s/g, "-");
}

function handleAddOption(type: ApplicationCommandOptionType) {
  addOption(type);
  showAddModal.value = false;
}

const hasSubCommands = computed(() =>
  command.value.options.some(
    (o) =>
      o.type === ApplicationCommandOptionType.SubCommand ||
      o.type === ApplicationCommandOptionType.SubCommandGroup,
  ),
);

const hasNonSubCommands = computed(() =>
  command.value.options.some(
    (o) =>
      o.type !== ApplicationCommandOptionType.SubCommand &&
      o.type !== ApplicationCommandOptionType.SubCommandGroup,
  ),
);

const disabledTypes = computed(() => {
  const disabled = new Set<ApplicationCommandOptionType>();
  if (hasSubCommands.value) {
    Object.values(ApplicationCommandOptionType)
      .filter((v) => typeof v === "number")
      .forEach((t) => {
        if (
          t !== ApplicationCommandOptionType.SubCommand &&
          t !== ApplicationCommandOptionType.SubCommandGroup
        )
          disabled.add(t as ApplicationCommandOptionType);
      });
  }
  if (hasNonSubCommands.value) {
    disabled.add(ApplicationCommandOptionType.SubCommand);
    disabled.add(ApplicationCommandOptionType.SubCommandGroup);
  }
  if (command.value.options.length >= 25) {
    Object.values(ApplicationCommandOptionType)
      .filter((v) => typeof v === "number")
      .forEach((t) => disabled.add(t as ApplicationCommandOptionType));
  }
  return disabled;
});

const optionTypes = Object.values(ApplicationCommandOptionType).filter(
  (v) => typeof v === "number",
) as ApplicationCommandOptionType[];
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <UCard variant="soft">
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-1">
          <label class="text-sm font-semibold text-highlighted">Command Name</label>
          <UInput
            :model-value="command.name"
            icon="ph:terminal-duotone"
            color="neutral"
            variant="subtle"
            size="lg"
            placeholder="ban"
            @input="onNameInput"
          />
          <p v-if="nameError" class="text-xs text-error">{{ nameError }}</p>
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-sm font-semibold text-highlighted">Description</label>
          <UInput
            v-model="command.description"
            icon="ph:text-align-left-duotone"
            color="neutral"
            variant="subtle"
            size="lg"
            placeholder="Ban a user from the server"
          />
          <p v-if="descError" class="text-xs text-error">{{ descError }}</p>
        </div>

        <USeparator />

        <div class="flex items-center justify-between">
          <span class="text-sm font-semibold text-highlighted">
            Options ({{ command.options.length }}/25)
          </span>
          <UButton
            icon="ph:plus"
            size="sm"
            variant="soft"
            :disabled="command.options.length >= 25"
            @click="showAddModal = true"
          >
            Add Option
          </UButton>
        </div>

        <VueDraggable
          v-model="command.options"
          handle=".drag-handle"
          :animation="150"
          class="flex flex-col gap-2"
        >
          <SlashOptionBlock
            v-for="option in command.options"
            :key="option.id"
            :option="option"
            :parent-id="undefined"
            :siblings="command.options"
          />
        </VueDraggable>

        <p
          v-if="command.options.length === 0"
          class="text-sm text-muted text-center py-4"
        >
          No options yet. Click "Add Option" to get started.
        </p>
      </div>
    </UCard>

    <SlashOutputPanel
      :get-clean-json="getCleanJSON"
      :get-discord-js-code="getDiscordJSCode"
      :get-discord-py-code="getDiscordPyCode"
    />

    <SlashAddOptionModal
      v-model:open="showAddModal"
      :disabled-types="disabledTypes"
      @select="handleAddOption"
    />
  </div>
</template>
