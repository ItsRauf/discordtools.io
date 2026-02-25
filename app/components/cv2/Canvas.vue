<script setup lang="ts">
import { VueDraggable } from "vue-draggable-plus";
import { ComponentType } from "~/types/componentsV2";

const builder = inject<ReturnType<typeof useComponentsBuilder>>("builder")!;

const topLevelTypes = [
  ComponentType.ActionRow,
  ComponentType.Section,
  ComponentType.TextDisplay,
  ComponentType.MediaGallery,
  ComponentType.File,
  ComponentType.Separator,
  ComponentType.Container,
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function onMoveToRoot(evt: any): boolean {
  const draggedType = evt.draggedContext?.element?.type;
  if (!draggedType) return false;
  if (!topLevelTypes.includes(draggedType)) return false;
  if (evt.from === evt.to) return true;
  if (builder.totalComponents.value >= 40) return false;
  if (builder.components.value.length >= 10) return false;
  return true;
}
</script>

<template>
  <UCard variant="outline" class="min-h-[400px]">
    <template #header>
      <h3 class="font-semibold text-highlighted">Preview</h3>
    </template>
    <VueDraggable
      v-model="builder.components.value"
      :animation="200"
      handle=".drag-handle"
      :group="{ name: 'cv2-components', put: true, pull: true }"
      :move="onMoveToRoot"
      class="flex flex-col gap-2 min-h-[200px]"
    >
      <Cv2ComponentBlock
        v-for="component in builder.components.value"
        :key="component._builderId"
        :component="component"
        :selected="builder.selectedId.value === component._builderId"
        @select="builder.selectComponent(component._builderId)"
        @remove="builder.removeComponent(component._builderId)"
      />
    </VueDraggable>
    <div
      v-if="builder.components.value.length === 0"
      class="text-center text-muted py-16"
    >
      <UIcon name="ph:plus-circle-duotone" class="size-12 mb-2" />
      <p>Click or drag a component from the palette to get started</p>
    </div>
  </UCard>
</template>
