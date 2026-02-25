<script setup lang="ts">
import { VueDraggable } from "vue-draggable-plus";
import {
  ComponentType,
  ButtonStyle,
  componentTypeLabels,
  componentTypeIcons,
  selectTypes,
} from "~/types/componentsV2";
import type {
  BuilderAnyComponent,
  BuilderActionRowData,
  BuilderSectionData,
  BuilderContainerData,
  BuilderTextDisplayData,
  BuilderButtonData,
  BuilderStringSelectData,
  BuilderMediaGalleryData,
  BuilderThumbnailData,
  BuilderFileData,
  BuilderSeparatorData,
  BuilderTopLevelComponent,
  BuilderActionRowChild,
} from "~/types/componentsV2";

const props = defineProps<{
  component: BuilderAnyComponent;
  selected: boolean;
  nested?: boolean;
}>();

const emit = defineEmits<{
  select: [];
  remove: [];
}>();

const builder = inject<ReturnType<typeof useComponentsBuilder>>("builder")!;

const label = computed(() => componentTypeLabels[props.component.type] ?? "Unknown");
const icon = computed(() => componentTypeIcons[props.component.type] ?? "ph:question-duotone");

const buttonColorMap: Record<number, string> = {
  [ButtonStyle.Primary]: "bg-indigo-500 text-white",
  [ButtonStyle.Secondary]: "bg-neutral-600 text-white",
  [ButtonStyle.Success]: "bg-green-600 text-white",
  [ButtonStyle.Danger]: "bg-red-500 text-white",
  [ButtonStyle.Link]: "bg-neutral-600 text-white",
  [ButtonStyle.Premium]: "bg-indigo-400 text-white",
};

const accentStyle = computed(() => {
  if (props.component.type !== ComponentType.Container) return {};
  const c = props.component as BuilderContainerData;
  if (!c.accent_color) return {};
  const hex = `#${c.accent_color.toString(16).padStart(6, "0")}`;
  return { borderLeftColor: hex };
});

const containerChildren = computed({
  get: () => (props.component as BuilderContainerData).components,
  set: (val) => {
    (props.component as BuilderContainerData).components = val as Exclude<BuilderTopLevelComponent, BuilderContainerData>[];
  },
});

const actionRowChildren = computed({
  get: () => (props.component as BuilderActionRowData).components,
  set: (val) => {
    (props.component as BuilderActionRowData).components = val as BuilderActionRowChild[];
  },
});

function canAddToActionRow(ar: BuilderActionRowData, type: ComponentType): boolean {
  if (ar.components.length >= 5) return false;
  const hasSelect = ar.components.some((c) => selectTypes.includes(c.type));
  const hasButton = ar.components.some((c) => c.type === ComponentType.Button);
  if (selectTypes.includes(type) && (hasButton || hasSelect)) return false;
  if (type === ComponentType.Button && hasSelect) return false;
  return true;
}

const containerAllowedTypes = [
  ComponentType.ActionRow,
  ComponentType.Section,
  ComponentType.TextDisplay,
  ComponentType.MediaGallery,
  ComponentType.File,
  ComponentType.Separator,
];

const actionRowAllowedTypes = [
  ComponentType.Button,
  ComponentType.StringSelect,
  ComponentType.UserSelect,
  ComponentType.RoleSelect,
  ComponentType.MentionableSelect,
  ComponentType.ChannelSelect,
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function onMoveToContainer(evt: any): boolean {
  const draggedType = evt.draggedContext?.element?.type;
  if (!draggedType) return false;
  if (!containerAllowedTypes.includes(draggedType)) return false;
  if (evt.from === evt.to) return true;
  if (builder.totalComponents.value >= 40) return false;
  return true;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function onMoveToActionRow(evt: any): boolean {
  const draggedType = evt.draggedContext?.element?.type;
  if (!draggedType) return false;
  if (!actionRowAllowedTypes.includes(draggedType)) return false;
  if (evt.from === evt.to) return true;
  if (builder.totalComponents.value >= 40) return false;
  return canAddToActionRow(props.component as BuilderActionRowData, draggedType);
}
</script>

<template>
  <div
    class="group rounded-lg border transition-all"
    :class="[
      selected ? 'ring-2 ring-primary border-primary' : 'border-neutral-700 hover:border-neutral-500',
      nested ? 'bg-elevated/50' : 'bg-elevated',
    ]"
    @click.stop="emit('select')"
  >
    <div class="flex items-center gap-2 px-3 py-2">
      <UIcon name="ph:dots-six-vertical" class="drag-handle cursor-grab text-muted shrink-0 size-4" />
      <UBadge variant="subtle" size="sm" class="shrink-0">
        <UIcon :name="icon" class="size-3.5 mr-1" />
        {{ label }}
      </UBadge>
      <div class="flex-1" />
      <UButton
        variant="ghost"
        color="error"
        size="xs"
        icon="ph:trash-simple-duotone"
        class="opacity-0 group-hover:opacity-100 transition-opacity"
        @click.stop="emit('remove')"
      />
    </div>

    <!-- Preview -->
    <div class="px-3 pb-2">
      <!-- TextDisplay -->
      <div v-if="component.type === ComponentType.TextDisplay" class="text-sm text-default whitespace-pre-wrap break-words">
        {{ (component as BuilderTextDisplayData).content || 'Empty text' }}
      </div>

      <!-- Button -->
      <div v-else-if="component.type === ComponentType.Button">
        <span
          class="inline-block px-3 py-1 rounded text-xs font-medium"
          :class="buttonColorMap[(component as BuilderButtonData).style] || 'bg-neutral-600 text-white'"
        >
          {{ (component as BuilderButtonData).label || 'Button' }}
          <UIcon v-if="(component as BuilderButtonData).style === ButtonStyle.Link" name="ph:arrow-square-out" class="size-3 ml-1 inline" />
        </span>
      </div>

      <!-- ActionRow -->
      <div v-else-if="component.type === ComponentType.ActionRow">
        <VueDraggable
          v-model="actionRowChildren"
          :animation="200"
          handle=".drag-handle"
          :group="{ name: 'cv2-components', put: true, pull: true }"
          :move="onMoveToActionRow"
          class="flex flex-wrap gap-2 min-h-[36px] rounded border border-dashed border-neutral-700 p-2"
        >
          <Cv2ComponentBlock
            v-for="child in (component as BuilderActionRowData).components"
            :key="child._builderId"
            :component="child"
            :selected="builder.selectedId.value === child._builderId"
            nested
            @select="builder.selectComponent(child._builderId)"
            @remove="builder.removeComponent(child._builderId)"
          />
        </VueDraggable>
        <div v-if="(component as BuilderActionRowData).components.length === 0" class="text-xs text-muted text-center py-1">
          Drag buttons or select menus here
        </div>
        <div class="flex gap-1 mt-2">
          <UButton
            size="xs"
            variant="soft"
            icon="ph:plus"
            :disabled="!canAddToActionRow(component as BuilderActionRowData, ComponentType.Button)"
            @click.stop="builder.addComponent(ComponentType.Button, component._builderId)"
          >
            Button
          </UButton>
          <UButton
            size="xs"
            variant="soft"
            icon="ph:plus"
            :disabled="!canAddToActionRow(component as BuilderActionRowData, ComponentType.StringSelect)"
            @click.stop="builder.addComponent(ComponentType.StringSelect, component._builderId)"
          >
            Select
          </UButton>
        </div>
      </div>

      <!-- Section -->
      <div v-else-if="component.type === ComponentType.Section" class="flex gap-4 items-start">
        <div class="flex-1 space-y-1">
          <div
            v-for="txt in (component as BuilderSectionData).components"
            :key="txt._builderId"
            class="text-sm text-default cursor-pointer rounded px-2 py-1 hover:bg-elevated"
            :class="builder.selectedId.value === txt._builderId ? 'ring-1 ring-primary' : ''"
            @click.stop="builder.selectComponent(txt._builderId)"
          >
            {{ txt.content || 'Empty text' }}
          </div>
          <div class="flex gap-1 mt-1">
            <UButton
              v-if="(component as BuilderSectionData).components.length < 3"
              size="xs"
              variant="soft"
              icon="ph:plus"
              @click.stop="builder.addComponent(ComponentType.TextDisplay, component._builderId)"
            >
              Text
            </UButton>
          </div>
        </div>
        <div class="shrink-0">
          <div
            v-if="(component as BuilderSectionData).accessory"
            class="flex items-center gap-1"
          >
            <span
              v-if="(component as BuilderSectionData).accessory?.type === ComponentType.Thumbnail"
              class="w-12 h-12 rounded bg-neutral-700 flex items-center justify-center"
            >
              <UIcon name="ph:image-duotone" class="size-6 text-muted" />
            </span>
            <span
              v-else-if="(component as BuilderSectionData).accessory?.type === ComponentType.Button"
              class="inline-block px-3 py-1 rounded text-xs font-medium bg-indigo-500 text-white"
            >
              {{ ((component as BuilderSectionData).accessory as BuilderButtonData)?.label || 'Button' }}
            </span>
            <UButton
              size="xs"
              variant="ghost"
              color="error"
              icon="ph:x"
              @click.stop="() => {
                const acc = (component as BuilderSectionData).accessory;
                if (acc && builder.selectedId.value === acc._builderId) builder.selectComponent(null);
                (component as BuilderSectionData).accessory = undefined;
              }"
            />
          </div>
          <div v-else class="flex gap-1">
            <UButton
              size="xs"
              variant="soft"
              icon="ph:image-duotone"
              @click.stop="() => {
                const t = { _builderId: crypto.randomUUID(), type: ComponentType.Thumbnail, media: { url: '' } };
                (component as BuilderSectionData).accessory = t as any;
              }"
            >
              Thumb
            </UButton>
            <UButton
              size="xs"
              variant="soft"
              icon="ph:cursor-click-duotone"
              @click.stop="() => {
                const b = { _builderId: crypto.randomUUID(), type: ComponentType.Button, style: 1, label: 'Click', custom_id: `btn_${crypto.randomUUID().slice(0,6)}` };
                (component as BuilderSectionData).accessory = b as any;
              }"
            >
              Button
            </UButton>
          </div>
        </div>
      </div>

      <!-- Container -->
      <div
        v-else-if="component.type === ComponentType.Container"
        class="border-l-4 rounded pl-3"
        :style="accentStyle"
      >
        <VueDraggable
          v-model="containerChildren"
          :animation="200"
          handle=".drag-handle"
          :group="{ name: 'cv2-components', put: true, pull: true }"
          :move="onMoveToContainer"
          class="flex flex-col gap-2 min-h-[40px] rounded border border-dashed border-neutral-700 p-2"
        >
          <Cv2ComponentBlock
            v-for="child in (component as BuilderContainerData).components"
            :key="child._builderId"
            :component="child"
            :selected="builder.selectedId.value === child._builderId"
            nested
            @select="builder.selectComponent(child._builderId)"
            @remove="builder.removeComponent(child._builderId)"
          />
        </VueDraggable>
        <div v-if="(component as BuilderContainerData).components.length === 0" class="text-xs text-muted text-center py-1">
          Drop components here (no nested containers)
        </div>
      </div>

      <!-- Separator -->
      <div v-else-if="component.type === ComponentType.Separator">
        <USeparator
          v-if="(component as BuilderSeparatorData).divider"
          :class="(component as BuilderSeparatorData).spacing === 2 ? 'my-4' : 'my-1'"
        />
        <div v-else :class="(component as BuilderSeparatorData).spacing === 2 ? 'h-8' : 'h-2'" />
      </div>

      <!-- MediaGallery -->
      <div v-else-if="component.type === ComponentType.MediaGallery" class="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <div
          v-for="item in (component as BuilderMediaGalleryData).items"
          :key="item._builderId"
          class="aspect-video rounded bg-neutral-700 flex items-center justify-center overflow-hidden"
        >
          <img
            v-if="item.media.url"
            :src="item.media.url"
            class="w-full h-full object-cover"
            @error="($event.target as HTMLImageElement).style.display = 'none'"
          >
          <UIcon v-else name="ph:image-duotone" class="size-8 text-muted" />
        </div>
      </div>

      <!-- Thumbnail -->
      <div v-else-if="component.type === ComponentType.Thumbnail" class="flex items-center gap-2">
        <div class="w-16 h-16 rounded bg-neutral-700 flex items-center justify-center overflow-hidden">
          <img
            v-if="(component as BuilderThumbnailData).media.url"
            :src="(component as BuilderThumbnailData).media.url"
            class="w-full h-full object-cover"
            @error="($event.target as HTMLImageElement).style.display = 'none'"
          >
          <UIcon v-else name="ph:image-duotone" class="size-8 text-muted" />
        </div>
        <span class="text-xs text-muted">{{ (component as BuilderThumbnailData).media.url || 'No image URL' }}</span>
      </div>

      <!-- File -->
      <div v-else-if="component.type === ComponentType.File" class="flex items-center gap-2 text-sm text-muted">
        <UIcon name="ph:file-duotone" class="size-5" />
        <span>{{ (component as BuilderFileData).file.url || 'No file URL' }}</span>
      </div>

      <!-- StringSelect -->
      <div
        v-else-if="component.type === ComponentType.StringSelect"
        class="bg-neutral-800 rounded px-3 py-2 text-sm text-muted flex items-center justify-between"
      >
        <span>{{ (component as BuilderStringSelectData).placeholder || 'Select...' }}</span>
        <UIcon name="ph:caret-down" class="size-4" />
      </div>

      <!-- Auto-populated Selects -->
      <div
        v-else-if="[ComponentType.UserSelect, ComponentType.RoleSelect, ComponentType.MentionableSelect, ComponentType.ChannelSelect].includes(component.type)"
        class="bg-neutral-800 rounded px-3 py-2 text-sm text-muted flex items-center justify-between"
      >
        <div class="flex items-center gap-2">
          <UIcon :name="icon" class="size-4" />
          <span>{{ (component as any).placeholder || 'Select...' }}</span>
        </div>
        <UIcon name="ph:caret-down" class="size-4" />
      </div>
    </div>

    <!-- Property Editor -->
    <div v-if="selected" class="border-t border-neutral-700" @click.stop>
      <Cv2PropertyEditor :component="component" />
    </div>
  </div>
</template>
