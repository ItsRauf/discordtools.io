<script setup lang="ts">
import {
  ComponentType,
  ButtonStyle,
  SeparatorSpacingSize,
} from "~/types/componentsV2";
import type {
  BuilderAnyComponent,
  BuilderTextDisplayData,
  BuilderButtonData,
  BuilderStringSelectData,
  BuilderUserSelectData,
  BuilderRoleSelectData,
  BuilderMentionableSelectData,
  BuilderChannelSelectData,
  BuilderSectionData,
  BuilderContainerData,
  BuilderSeparatorData,
  BuilderMediaGalleryData,
  BuilderThumbnailData,
  BuilderFileData,
  BuilderSelectOption,
} from "~/types/componentsV2";

const props = defineProps<{
  component: BuilderAnyComponent;
}>();

const builder = inject<ReturnType<typeof useComponentsBuilder>>("builder")!;

function update(updates: Record<string, unknown>) {
  builder.updateComponent(props.component._builderId, updates);
}

const buttonStyleOptions = [
  { label: "Primary", value: ButtonStyle.Primary },
  { label: "Secondary", value: ButtonStyle.Secondary },
  { label: "Success", value: ButtonStyle.Success },
  { label: "Danger", value: ButtonStyle.Danger },
  { label: "Link", value: ButtonStyle.Link },
];

const spacingOptions = [
  { label: "Small", value: SeparatorSpacingSize.Small },
  { label: "Large", value: SeparatorSpacingSize.Large },
];

function addSelectOption(comp: BuilderStringSelectData) {
  if (comp.options.length >= 25) return;
  const n = comp.options.length + 1;
  comp.options.push({
    _builderId: crypto.randomUUID(),
    label: `Option ${n}`,
    value: String(n),
  });
}

function removeSelectOption(comp: BuilderStringSelectData, idx: number) {
  comp.options.splice(idx, 1);
}

function addGalleryItem(comp: BuilderMediaGalleryData) {
  if (comp.items.length >= 10) return;
  comp.items.push({
    _builderId: crypto.randomUUID(),
    media: { url: "" },
    description: "",
  });
}

function removeGalleryItem(comp: BuilderMediaGalleryData, idx: number) {
  comp.items.splice(idx, 1);
}

function hexToInt(hex: string): number {
  return parseInt(hex.replace("#", ""), 16);
}

function intToHex(n: number | undefined): string {
  if (!n) return "#000000";
  return `#${n.toString(16).padStart(6, "0")}`;
}
</script>

<template>
  <div class="p-3 space-y-3 text-sm">
    <!-- TextDisplay -->
    <template v-if="component.type === ComponentType.TextDisplay">
      <div>
        <label class="block text-xs text-muted mb-1">Content (markdown)</label>
        <UTextarea
          :model-value="(component as BuilderTextDisplayData).content"
          placeholder="Enter markdown text..."
          :maxlength="4000"
          :rows="3"
          @update:model-value="update({ content: $event })"
        />
        <span class="text-xs text-muted">{{ (component as BuilderTextDisplayData).content.length }}/4000</span>
      </div>
    </template>

    <!-- Button -->
    <template v-else-if="component.type === ComponentType.Button">
      <div>
        <label class="block text-xs text-muted mb-1">Style</label>
        <USelect
          :model-value="(component as BuilderButtonData).style"
          :items="buttonStyleOptions"
          value-key="value"
          @update:model-value="update({ style: Number($event), ...(Number($event) === ButtonStyle.Link ? { custom_id: undefined } : { url: undefined }) })"
        />
      </div>
      <div>
        <label class="block text-xs text-muted mb-1">Label</label>
        <UInput
          :model-value="(component as BuilderButtonData).label"
          placeholder="Button label"
          :maxlength="80"
          @update:model-value="update({ label: $event })"
        />
      </div>
      <div v-if="(component as BuilderButtonData).style !== ButtonStyle.Link">
        <label class="block text-xs text-muted mb-1">Custom ID</label>
        <UInput
          :model-value="(component as BuilderButtonData).custom_id"
          placeholder="custom_id"
          :maxlength="100"
          @update:model-value="update({ custom_id: $event })"
        />
      </div>
      <div v-else>
        <label class="block text-xs text-muted mb-1">URL</label>
        <UInput
          :model-value="(component as BuilderButtonData).url"
          placeholder="https://example.com"
          @update:model-value="update({ url: $event })"
        />
      </div>
      <div class="flex items-center gap-2">
        <USwitch
          :model-value="(component as BuilderButtonData).disabled || false"
          @update:model-value="update({ disabled: $event })"
        />
        <label class="text-xs text-muted">Disabled</label>
      </div>
    </template>

    <!-- ActionRow -->
    <template v-else-if="component.type === ComponentType.ActionRow">
      <p class="text-xs text-muted">
        Action Rows contain up to 5 buttons OR 1 select menu. Use the buttons above to add children.
      </p>
    </template>

    <!-- Section -->
    <template v-else-if="component.type === ComponentType.Section">
      <div
        v-for="(txt, idx) in (component as BuilderSectionData).components"
        :key="txt._builderId"
        class="flex gap-2 items-start"
      >
        <UTextarea
          :model-value="txt.content"
          :placeholder="`Text ${idx + 1}`"
          :rows="2"
          class="flex-1"
          :maxlength="4000"
          @update:model-value="txt.content = ($event as string)"
        />
        <UButton
          v-if="(component as BuilderSectionData).components.length > 1"
          size="xs"
          variant="ghost"
          color="error"
          icon="ph:x"
          @click="(component as BuilderSectionData).components.splice(idx, 1)"
        />
      </div>
      <div v-if="(component as BuilderSectionData).accessory">
        <label class="block text-xs text-muted mb-1">Accessory</label>
        <div v-if="(component as BuilderSectionData).accessory?.type === ComponentType.Thumbnail">
          <UInput
            :model-value="((component as BuilderSectionData).accessory as BuilderThumbnailData).media.url"
            placeholder="Thumbnail URL"
            @update:model-value="((component as BuilderSectionData).accessory as BuilderThumbnailData).media.url = ($event as string)"
          />
        </div>
        <div v-else-if="(component as BuilderSectionData).accessory?.type === ComponentType.Button" class="space-y-2">
          <UInput
            :model-value="((component as BuilderSectionData).accessory as BuilderButtonData).label"
            placeholder="Button label"
            :maxlength="80"
            @update:model-value="((component as BuilderSectionData).accessory as BuilderButtonData).label = ($event as string)"
          />
          <UInput
            :model-value="((component as BuilderSectionData).accessory as BuilderButtonData).custom_id"
            placeholder="custom_id"
            :maxlength="100"
            @update:model-value="((component as BuilderSectionData).accessory as BuilderButtonData).custom_id = ($event as string)"
          />
        </div>
      </div>
    </template>

    <!-- Container -->
    <template v-else-if="component.type === ComponentType.Container">
      <div>
        <label class="block text-xs text-muted mb-1">Accent Color</label>
        <div class="flex items-center gap-2">
          <input
            type="color"
            :value="intToHex((component as BuilderContainerData).accent_color)"
            class="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
            @input="update({ accent_color: hexToInt(($event.target as HTMLInputElement).value) })"
          >
          <UInput
            :model-value="intToHex((component as BuilderContainerData).accent_color)"
            placeholder="#000000"
            class="flex-1"
            @update:model-value="update({ accent_color: hexToInt($event as string) })"
          />
        </div>
      </div>
      <div class="flex items-center gap-2">
        <USwitch
          :model-value="(component as BuilderContainerData).spoiler || false"
          @update:model-value="update({ spoiler: $event })"
        />
        <label class="text-xs text-muted">Spoiler</label>
      </div>
    </template>

    <!-- Separator -->
    <template v-else-if="component.type === ComponentType.Separator">
      <div class="flex items-center gap-2">
        <USwitch
          :model-value="(component as BuilderSeparatorData).divider ?? true"
          @update:model-value="update({ divider: $event })"
        />
        <label class="text-xs text-muted">Show divider line</label>
      </div>
      <div>
        <label class="block text-xs text-muted mb-1">Spacing</label>
        <USelect
          :model-value="(component as BuilderSeparatorData).spacing ?? SeparatorSpacingSize.Small"
          :items="spacingOptions"
          value-key="value"
          @update:model-value="update({ spacing: Number($event) })"
        />
      </div>
    </template>

    <!-- MediaGallery -->
    <template v-else-if="component.type === ComponentType.MediaGallery">
      <div
        v-for="(item, idx) in (component as BuilderMediaGalleryData).items"
        :key="item._builderId"
        class="flex gap-2 items-start border border-neutral-700 rounded p-2"
      >
        <div class="flex-1 space-y-2">
          <UInput
            :model-value="item.media.url"
            placeholder="Image URL"
            @update:model-value="item.media.url = ($event as string)"
          />
          <UInput
            :model-value="item.description"
            placeholder="Description (optional)"
            :maxlength="1024"
            @update:model-value="item.description = ($event as string)"
          />
          <div class="flex items-center gap-2">
            <USwitch
              :model-value="item.spoiler || false"
              @update:model-value="item.spoiler = ($event as boolean)"
            />
            <label class="text-xs text-muted">Spoiler</label>
          </div>
        </div>
        <UButton
          v-if="(component as BuilderMediaGalleryData).items.length > 1"
          size="xs"
          variant="ghost"
          color="error"
          icon="ph:x"
          @click="removeGalleryItem(component as BuilderMediaGalleryData, idx)"
        />
      </div>
      <UButton
        size="xs"
        variant="soft"
        icon="ph:plus"
        :disabled="(component as BuilderMediaGalleryData).items.length >= 10"
        @click="addGalleryItem(component as BuilderMediaGalleryData)"
      >
        Add Media ({{ (component as BuilderMediaGalleryData).items.length }}/10)
      </UButton>
    </template>

    <!-- Thumbnail -->
    <template v-else-if="component.type === ComponentType.Thumbnail">
      <div>
        <label class="block text-xs text-muted mb-1">Image URL</label>
        <UInput
          :model-value="(component as BuilderThumbnailData).media.url"
          placeholder="https://example.com/image.png"
          @update:model-value="(component as BuilderThumbnailData).media.url = ($event as string)"
        />
      </div>
      <div>
        <label class="block text-xs text-muted mb-1">Description</label>
        <UInput
          :model-value="(component as BuilderThumbnailData).description"
          placeholder="Alt text (optional)"
          :maxlength="1024"
          @update:model-value="update({ description: $event })"
        />
      </div>
      <div class="flex items-center gap-2">
        <USwitch
          :model-value="(component as BuilderThumbnailData).spoiler || false"
          @update:model-value="update({ spoiler: $event })"
        />
        <label class="text-xs text-muted">Spoiler</label>
      </div>
    </template>

    <!-- File -->
    <template v-else-if="component.type === ComponentType.File">
      <div>
        <label class="block text-xs text-muted mb-1">File URL</label>
        <UInput
          :model-value="(component as BuilderFileData).file.url"
          placeholder="attachment://file.txt"
          @update:model-value="(component as BuilderFileData).file.url = ($event as string)"
        />
      </div>
      <div class="flex items-center gap-2">
        <USwitch
          :model-value="(component as BuilderFileData).spoiler || false"
          @update:model-value="update({ spoiler: $event })"
        />
        <label class="text-xs text-muted">Spoiler</label>
      </div>
    </template>

    <!-- StringSelect -->
    <template v-else-if="component.type === ComponentType.StringSelect">
      <div>
        <label class="block text-xs text-muted mb-1">Custom ID</label>
        <UInput
          :model-value="(component as BuilderStringSelectData).custom_id"
          placeholder="custom_id"
          :maxlength="100"
          @update:model-value="update({ custom_id: $event })"
        />
      </div>
      <div>
        <label class="block text-xs text-muted mb-1">Placeholder</label>
        <UInput
          :model-value="(component as BuilderStringSelectData).placeholder"
          placeholder="Placeholder text"
          :maxlength="150"
          @update:model-value="update({ placeholder: $event })"
        />
      </div>
      <div class="grid grid-cols-2 gap-2">
        <div>
          <label class="block text-xs text-muted mb-1">Min Values</label>
          <UInput
            type="number"
            :model-value="(component as BuilderStringSelectData).min_values ?? 0"
            :min="0"
            :max="25"
            @update:model-value="update({ min_values: Number($event) })"
          />
        </div>
        <div>
          <label class="block text-xs text-muted mb-1">Max Values</label>
          <UInput
            type="number"
            :model-value="(component as BuilderStringSelectData).max_values ?? 1"
            :min="1"
            :max="25"
            @update:model-value="update({ max_values: Number($event) })"
          />
        </div>
      </div>
      <div class="flex items-center gap-2">
        <USwitch
          :model-value="(component as BuilderStringSelectData).disabled || false"
          @update:model-value="update({ disabled: $event })"
        />
        <label class="text-xs text-muted">Disabled</label>
      </div>
      <div>
        <label class="block text-xs text-muted mb-1">Options</label>
        <div class="space-y-2">
          <div
            v-for="(opt, idx) in (component as BuilderStringSelectData).options"
            :key="opt._builderId"
            class="flex gap-2 items-start border border-neutral-700 rounded p-2"
          >
            <div class="flex-1 grid grid-cols-2 gap-2">
              <UInput
                :model-value="opt.label"
                placeholder="Label"
                :maxlength="100"
                @update:model-value="opt.label = ($event as string)"
              />
              <UInput
                :model-value="opt.value"
                placeholder="Value"
                :maxlength="100"
                @update:model-value="opt.value = ($event as string)"
              />
              <UInput
                :model-value="opt.description"
                placeholder="Description (optional)"
                :maxlength="100"
                class="col-span-2"
                @update:model-value="opt.description = ($event as string)"
              />
              <div class="flex items-center gap-2 col-span-2">
                <USwitch
                  :model-value="opt.default || false"
                  @update:model-value="opt.default = ($event as boolean)"
                />
                <label class="text-xs text-muted">Default</label>
              </div>
            </div>
            <UButton
              v-if="(component as BuilderStringSelectData).options.length > 1"
              size="xs"
              variant="ghost"
              color="error"
              icon="ph:x"
              @click="removeSelectOption(component as BuilderStringSelectData, idx)"
            />
          </div>
        </div>
        <UButton
          size="xs"
          variant="soft"
          icon="ph:plus"
          class="mt-2"
          :disabled="(component as BuilderStringSelectData).options.length >= 25"
          @click="addSelectOption(component as BuilderStringSelectData)"
        >
          Add Option ({{ (component as BuilderStringSelectData).options.length }}/25)
        </UButton>
      </div>
    </template>

    <!-- UserSelect / RoleSelect / MentionableSelect / ChannelSelect -->
    <template v-else-if="[ComponentType.UserSelect, ComponentType.RoleSelect, ComponentType.MentionableSelect, ComponentType.ChannelSelect].includes(component.type)">
      <div>
        <label class="block text-xs text-muted mb-1">Custom ID</label>
        <UInput
          :model-value="(component as BuilderUserSelectData | BuilderRoleSelectData | BuilderMentionableSelectData | BuilderChannelSelectData).custom_id"
          placeholder="custom_id"
          :maxlength="100"
          @update:model-value="update({ custom_id: $event })"
        />
      </div>
      <div>
        <label class="block text-xs text-muted mb-1">Placeholder</label>
        <UInput
          :model-value="(component as BuilderUserSelectData | BuilderRoleSelectData | BuilderMentionableSelectData | BuilderChannelSelectData).placeholder"
          placeholder="Placeholder text"
          :maxlength="150"
          @update:model-value="update({ placeholder: $event })"
        />
      </div>
      <div class="flex items-center gap-2">
        <USwitch
          :model-value="(component as BuilderUserSelectData | BuilderRoleSelectData | BuilderMentionableSelectData | BuilderChannelSelectData).disabled || false"
          @update:model-value="update({ disabled: $event })"
        />
        <label class="text-xs text-muted">Disabled</label>
      </div>
    </template>
  </div>
</template>
