<script setup lang="ts">
import { VueDraggable } from "vue-draggable-plus";
import {
  ApplicationCommandOptionType,
  ChannelType,
  channelTypeLabels,
  optionTypeLabels,
  optionTypeIcons,
  optionTypeColors,
  type ApplicationCommandOption,
  type ApplicationCommandOptionChoice,
} from "~/types/slashCommand";

const props = defineProps<{
  option: ApplicationCommandOption;
  parentId?: string;
  siblings: ApplicationCommandOption[];
}>();

const ctx = inject<{
  addOption: (type: ApplicationCommandOptionType, parentId?: string) => void;
  updateOption: (id: string, updates: Partial<ApplicationCommandOption>) => void;
  removeOption: (id: string) => void;
  reorderOptions: (parentId: string | null, fromIndex: number, toIndex: number) => void;
  addChoice: (optionId: string) => void;
  updateChoice: (optionId: string, choiceId: string, updates: Partial<ApplicationCommandOptionChoice>) => void;
  removeChoice: (optionId: string, choiceId: string) => void;
}>("slashCommand")!;

const nameRegex = /^[-_\p{L}\p{N}\p{sc=Deva}\p{sc=Thai}]{1,32}$/u;

const nameError = computed(() => {
  if (!props.option.name) return undefined;
  if (props.option.name !== props.option.name.toLowerCase()) return "Must be lowercase";
  if (props.option.name.includes(" ")) return "No spaces allowed";
  if (!nameRegex.test(props.option.name)) return "Invalid characters";
  return undefined;
});

const descError = computed(() => {
  if (!props.option.description) return undefined;
  if (props.option.description.length > 100) return "Max 100 characters";
  return undefined;
});

function onNameInput(e: Event) {
  const target = e.target as HTMLInputElement;
  ctx.updateOption(props.option.id, {
    name: target.value.toLowerCase().replace(/\s/g, "-"),
  });
}

const showNestedModal = ref(false);

const isSubCommand = computed(
  () => props.option.type === ApplicationCommandOptionType.SubCommand,
);
const isSubCommandGroup = computed(
  () => props.option.type === ApplicationCommandOptionType.SubCommandGroup,
);

const hasChoices = computed(() =>
  [
    ApplicationCommandOptionType.String,
    ApplicationCommandOptionType.Integer,
    ApplicationCommandOptionType.Number,
  ].includes(props.option.type),
);

const hasMinMax = computed(() =>
  [
    ApplicationCommandOptionType.Integer,
    ApplicationCommandOptionType.Number,
  ].includes(props.option.type),
);

const hasStringLength = computed(
  () => props.option.type === ApplicationCommandOptionType.String,
);

const hasAutocomplete = computed(() =>
  [
    ApplicationCommandOptionType.String,
    ApplicationCommandOptionType.Integer,
    ApplicationCommandOptionType.Number,
  ].includes(props.option.type),
);

const isChannelType = computed(
  () => props.option.type === ApplicationCommandOptionType.Channel,
);

const allowDecimals = computed(
  () => props.option.type === ApplicationCommandOptionType.Number,
);

const channelOptions = computed(() =>
  [
    ChannelType.GuildText,
    ChannelType.GuildVoice,
    ChannelType.GuildCategory,
    ChannelType.GuildAnnouncement,
    ChannelType.GuildStageVoice,
    ChannelType.GuildForum,
    ChannelType.GuildMedia,
  ].map((ct) => ({
    label: channelTypeLabels[ct] || String(ct),
    value: ct,
  })),
);

const nestedDisabledTypes = computed(() => {
  const disabled = new Set<ApplicationCommandOptionType>();
  if (isSubCommand.value) {
    disabled.add(ApplicationCommandOptionType.SubCommand);
    disabled.add(ApplicationCommandOptionType.SubCommandGroup);
  }
  if (isSubCommandGroup.value) {
    Object.values(ApplicationCommandOptionType)
      .filter((v) => typeof v === "number")
      .forEach((t) => {
        if (t !== ApplicationCommandOptionType.SubCommand)
          disabled.add(t as ApplicationCommandOptionType);
      });
  }
  const nested = props.option.options || [];
  if (nested.length >= 25) {
    Object.values(ApplicationCommandOptionType)
      .filter((v) => typeof v === "number")
      .forEach((t) => disabled.add(t as ApplicationCommandOptionType));
  }
  return disabled;
});

function handleNestedAdd(type: ApplicationCommandOptionType) {
  ctx.addOption(type, props.option.id);
  showNestedModal.value = false;
}

function onAutocompleteToggle(val: boolean) {
  ctx.updateOption(props.option.id, { autocomplete: val });
  if (val) {
    ctx.updateOption(props.option.id, { choices: [] });
  }
}

function onChannelTypesChange(vals: number[]) {
  ctx.updateOption(props.option.id, { channel_types: vals as ChannelType[] });
}

const nestedOptions = computed(() => props.option.options || []);

const badgeColor = computed(
  () => optionTypeColors[props.option.type] as "info" | "success" | "warning" | "neutral" | "primary" | "error",
);
</script>

<template>
  <UCard
    variant="outline"
    :ui="{ root: 'border-l-2 border-l-primary' }"
  >
    <div class="flex flex-col gap-3">
      <div class="flex items-center gap-2 flex-wrap">
        <UIcon name="ph:dots-six-vertical" class="text-muted cursor-grab drag-handle shrink-0" />
        <UBadge :color="badgeColor" variant="subtle" size="sm">
          <UIcon :name="optionTypeIcons[option.type]" class="size-3.5 mr-1" />
          {{ optionTypeLabels[option.type] }}
        </UBadge>
        <div class="flex-1" />
        <UTooltip text="Remove option">
          <UButton
            icon="ph:trash-simple-duotone"
            color="error"
            variant="ghost"
            size="xs"
            @click="ctx.removeOption(option.id)"
          />
        </UTooltip>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div class="flex flex-col gap-1">
          <label class="text-xs font-semibold text-muted">Name</label>
          <UInput
            :model-value="option.name"
            color="neutral"
            variant="subtle"
            size="sm"
            placeholder="option-name"
            @input="onNameInput"
          />
          <p v-if="nameError" class="text-xs text-error">{{ nameError }}</p>
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs font-semibold text-muted">Description</label>
          <UInput
            :model-value="option.description"
            color="neutral"
            variant="subtle"
            size="sm"
            placeholder="Describe this option"
            @input="(e: Event) => ctx.updateOption(option.id, { description: (e.target as HTMLInputElement).value })"
          />
          <p v-if="descError" class="text-xs text-error">{{ descError }}</p>
        </div>
      </div>

      <div
        v-if="!isSubCommand && !isSubCommandGroup"
        class="flex items-center gap-4 flex-wrap"
      >
        <label class="flex items-center gap-2 text-xs">
          <USwitch
            :model-value="option.required || false"
            size="sm"
            @update:model-value="(val: boolean) => ctx.updateOption(option.id, { required: val })"
          />
          <span class="text-muted">Required</span>
        </label>
        <label v-if="hasAutocomplete" class="flex items-center gap-2 text-xs">
          <USwitch
            :model-value="option.autocomplete || false"
            size="sm"
            @update:model-value="onAutocompleteToggle"
          />
          <span class="text-muted">Autocomplete</span>
        </label>
      </div>

      <div v-if="hasStringLength" class="grid grid-cols-2 gap-3">
        <div class="flex flex-col gap-1">
          <label class="text-xs font-semibold text-muted">Min Length</label>
          <UInput
            type="number"
            :model-value="option.min_length"
            color="neutral"
            variant="subtle"
            size="sm"
            placeholder="0"
            min="0"
            max="6000"
            @input="(e: Event) => {
              const v = (e.target as HTMLInputElement).value;
              ctx.updateOption(option.id, { min_length: v ? Number(v) : undefined });
            }"
          />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs font-semibold text-muted">Max Length</label>
          <UInput
            type="number"
            :model-value="option.max_length"
            color="neutral"
            variant="subtle"
            size="sm"
            placeholder="6000"
            min="1"
            max="6000"
            @input="(e: Event) => {
              const v = (e.target as HTMLInputElement).value;
              ctx.updateOption(option.id, { max_length: v ? Number(v) : undefined });
            }"
          />
        </div>
      </div>

      <div v-if="hasMinMax" class="grid grid-cols-2 gap-3">
        <div class="flex flex-col gap-1">
          <label class="text-xs font-semibold text-muted">Min Value</label>
          <UInput
            type="number"
            :model-value="option.min_value"
            color="neutral"
            variant="subtle"
            size="sm"
            placeholder="Min"
            :step="allowDecimals ? 'any' : '1'"
            @input="(e: Event) => {
              const v = (e.target as HTMLInputElement).value;
              ctx.updateOption(option.id, { min_value: v ? Number(v) : undefined });
            }"
          />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs font-semibold text-muted">Max Value</label>
          <UInput
            type="number"
            :model-value="option.max_value"
            color="neutral"
            variant="subtle"
            size="sm"
            placeholder="Max"
            :step="allowDecimals ? 'any' : '1'"
            @input="(e: Event) => {
              const v = (e.target as HTMLInputElement).value;
              ctx.updateOption(option.id, { max_value: v ? Number(v) : undefined });
            }"
          />
        </div>
      </div>

      <div v-if="isChannelType" class="flex flex-col gap-1">
        <label class="text-xs font-semibold text-muted">Channel Types</label>
        <USelectMenu
          :model-value="option.channel_types || []"
          :items="channelOptions"
          multiple
          size="sm"
          placeholder="All channel types"
          value-key="value"
          @update:model-value="onChannelTypesChange"
        />
      </div>

      <div v-if="hasChoices && !option.autocomplete" class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <label class="text-xs font-semibold text-muted">
            Choices ({{ (option.choices || []).length }}/25)
          </label>
          <UButton
            icon="ph:plus"
            size="xs"
            variant="ghost"
            :disabled="(option.choices || []).length >= 25"
            @click="ctx.addChoice(option.id)"
          >
            Add
          </UButton>
        </div>
        <VueDraggable
          :model-value="option.choices || []"
          handle=".choice-drag-handle"
          :animation="150"
          group="choices"
          @update:model-value="(val: ApplicationCommandOptionChoice[]) => ctx.updateOption(option.id, { choices: val })"
        >
          <SlashChoiceBlock
            v-for="choice in option.choices"
            :key="choice.id"
            :choice="choice"
            :option-id="option.id"
            :option-type="option.type"
          />
        </VueDraggable>
      </div>

      <div v-if="isSubCommand || isSubCommandGroup" class="flex flex-col gap-2 mt-2">
        <div class="flex items-center justify-between">
          <label class="text-xs font-semibold text-muted">
            {{ isSubCommandGroup ? "Sub Commands" : "Options" }}
            ({{ nestedOptions.length }}/25)
          </label>
          <UButton
            icon="ph:plus"
            size="xs"
            variant="ghost"
            :disabled="nestedOptions.length >= 25"
            @click="showNestedModal = true"
          >
            Add {{ isSubCommandGroup ? "Sub Command" : "Option" }}
          </UButton>
        </div>
        <VueDraggable
          :model-value="nestedOptions"
          handle=".drag-handle"
          :animation="150"
          group="options"
          class="flex flex-col gap-2"
          @update:model-value="(val: ApplicationCommandOption[]) => ctx.updateOption(option.id, { options: val })"
        >
          <SlashOptionBlock
            v-for="nested in nestedOptions"
            :key="nested.id"
            :option="nested"
            :parent-id="option.id"
            :siblings="nestedOptions"
          />
        </VueDraggable>
        <SlashAddOptionModal
          v-model:open="showNestedModal"
          :disabled-types="nestedDisabledTypes"
          @select="handleNestedAdd"
        />
      </div>
    </div>
  </UCard>
</template>
