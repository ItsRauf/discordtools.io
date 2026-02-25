<script setup lang="ts">
import { VueDraggable } from "vue-draggable-plus";
import {
  componentCategories,
  componentTypeLabels,
  componentTypeIcons,
  interactiveTypes,
  ComponentType,
} from "~/types/componentsV2";
import type { BuilderAnyComponent } from "~/types/componentsV2";

const builder = inject<ReturnType<typeof useComponentsBuilder>>("builder")!;
const toast = useToast();

interface PaletteItem {
  _builderId: string;
  type: ComponentType;
}

function makePaletteItems(types: readonly ComponentType[]): PaletteItem[] {
  return types.map((type) => ({ _builderId: `palette-${type}`, type }));
}

const layoutItems = makePaletteItems(componentCategories.Layout);
const contentItems = makePaletteItems(componentCategories.Content);
const interactiveItems = makePaletteItems(componentCategories.Interactive);

const categoryData = computed(() => [
  { label: "Layout", items: layoutItems },
  { label: "Content", items: contentItems },
  { label: "Interactive", items: interactiveItems },
]);

function onClone(item: PaletteItem): BuilderAnyComponent {
  return builder.createComponent(item.type);
}

const topLevelTypes = [
  ComponentType.ActionRow,
  ComponentType.Section,
  ComponentType.TextDisplay,
  ComponentType.MediaGallery,
  ComponentType.File,
  ComponentType.Separator,
  ComponentType.Container,
];

function isInteractive(type: ComponentType): boolean {
  return interactiveTypes.includes(type);
}

function handleClick(type: ComponentType) {
  if (!topLevelTypes.includes(type)) {
    if (isInteractive(type)) {
      toast.add({ title: "Must be placed inside an Action Row", description: "Drag this component into an Action Row instead.", duration: 2500 });
    } else {
      toast.add({ title: "Cannot add at top level", description: "Drag this component into a Section instead.", duration: 2500 });
    }
    return;
  }
  if (builder.components.value.length >= 10) {
    toast.add({ title: "Limit reached", description: "Maximum 10 top-level components.", duration: 2500 });
    return;
  }
  builder.addComponent(type);
}
</script>

<template>
  <UCard variant="soft">
    <template #header>
      <h3 class="font-semibold text-highlighted">Components</h3>
    </template>
    <div class="flex flex-col gap-4 lg:gap-3">
      <div v-for="cat in categoryData" :key="cat.label">
        <h4 class="text-xs uppercase tracking-wider text-muted mb-2">{{ cat.label }}</h4>
        <VueDraggable
          :model-value="cat.items"
          :group="{ name: 'cv2-components', pull: 'clone', put: false }"
          :sort="false"
          :clone="onClone"
          class="flex flex-row flex-wrap lg:flex-col gap-1"
        >
          <div
            v-for="item in cat.items"
            :key="item._builderId"
            class="flex items-center gap-2 px-2 py-1.5 rounded cursor-grab select-none transition-colors"
            :class="isInteractive(item.type) ? 'hover:bg-neutral-700/30 opacity-70' : 'hover:bg-neutral-700/50'"
            @click="handleClick(item.type)"
          >
            <UIcon :name="componentTypeIcons[item.type]!" class="size-4 text-muted shrink-0" />
            <span class="text-sm">{{ componentTypeLabels[item.type] }}</span>
          </div>
        </VueDraggable>
      </div>
    </div>
  </UCard>
</template>
