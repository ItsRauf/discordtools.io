import {
  ComponentType,
  ButtonStyle,
  SeparatorSpacingSize,
} from "discord-api-types/v10";
import type {
  BuilderTopLevelComponent,
  BuilderAnyComponent,
  BuilderActionRowData,
  BuilderButtonData,
  BuilderStringSelectData,
  BuilderUserSelectData,
  BuilderRoleSelectData,
  BuilderMentionableSelectData,
  BuilderChannelSelectData,
  BuilderSectionData,
  BuilderTextDisplayData,
  BuilderThumbnailData,
  BuilderMediaGalleryData,
  BuilderFileData,
  BuilderSeparatorData,
  BuilderContainerData,
  BuilderSelectOption,
  BuilderMediaGalleryItem,
} from "~/types/componentsV2";

function uid(): string {
  return crypto.randomUUID();
}

function createComponentFromType(type: ComponentType): BuilderAnyComponent {
  switch (type) {
    case ComponentType.TextDisplay:
      return { _builderId: uid(), type: ComponentType.TextDisplay, content: "Hello world" } as BuilderTextDisplayData;
    case ComponentType.Button:
      return { _builderId: uid(), type: ComponentType.Button, style: ButtonStyle.Primary, label: "Click me", custom_id: `button_${uid().slice(0, 6)}` } as BuilderButtonData;
    case ComponentType.ActionRow:
      return { _builderId: uid(), type: ComponentType.ActionRow, components: [] } as BuilderActionRowData;
    case ComponentType.Section:
      return {
        _builderId: uid(),
        type: ComponentType.Section,
        components: [{ _builderId: uid(), type: ComponentType.TextDisplay, content: "Section text" } as BuilderTextDisplayData],
      } as BuilderSectionData;
    case ComponentType.Container:
      return { _builderId: uid(), type: ComponentType.Container, components: [], spoiler: false } as BuilderContainerData;
    case ComponentType.Separator:
      return { _builderId: uid(), type: ComponentType.Separator, divider: true, spacing: SeparatorSpacingSize.Small } as BuilderSeparatorData;
    case ComponentType.StringSelect:
      return {
        _builderId: uid(),
        type: ComponentType.StringSelect,
        custom_id: `select_${uid().slice(0, 6)}`,
        placeholder: "Choose an option",
        options: [{ _builderId: uid(), label: "Option 1", value: "1" } as BuilderSelectOption],
      } as BuilderStringSelectData;
    case ComponentType.UserSelect:
      return { _builderId: uid(), type: ComponentType.UserSelect, custom_id: `select_${uid().slice(0, 6)}`, placeholder: "Choose a user..." } as BuilderUserSelectData;
    case ComponentType.RoleSelect:
      return { _builderId: uid(), type: ComponentType.RoleSelect, custom_id: `select_${uid().slice(0, 6)}`, placeholder: "Choose a role..." } as BuilderRoleSelectData;
    case ComponentType.MentionableSelect:
      return { _builderId: uid(), type: ComponentType.MentionableSelect, custom_id: `select_${uid().slice(0, 6)}`, placeholder: "Choose..." } as BuilderMentionableSelectData;
    case ComponentType.ChannelSelect:
      return { _builderId: uid(), type: ComponentType.ChannelSelect, custom_id: `select_${uid().slice(0, 6)}`, placeholder: "Choose a channel..." } as BuilderChannelSelectData;
    case ComponentType.MediaGallery:
      return {
        _builderId: uid(),
        type: ComponentType.MediaGallery,
        items: [{ _builderId: uid(), media: { url: "" }, description: "" } as BuilderMediaGalleryItem],
      } as BuilderMediaGalleryData;
    case ComponentType.Thumbnail:
      return { _builderId: uid(), type: ComponentType.Thumbnail, media: { url: "" } } as BuilderThumbnailData;
    case ComponentType.File:
      return { _builderId: uid(), type: ComponentType.File, file: { url: "attachment://file.txt" } } as BuilderFileData;
    default:
      return { _builderId: uid(), type: ComponentType.TextDisplay, content: "" } as BuilderTextDisplayData;
  }
}

function countComponents(components: BuilderTopLevelComponent[]): number {
  let count = 0;
  for (const c of components) {
    count++;
    if (c.type === ComponentType.ActionRow) {
      count += c.components.length;
    } else if (c.type === ComponentType.Section) {
      count += c.components.length;
      if (c.accessory) count++;
    } else if (c.type === ComponentType.Container) {
      count += countComponents(c.components as BuilderTopLevelComponent[]);
    } else if (c.type === ComponentType.MediaGallery) {
      count += c.items.length;
    }
  }
  return count;
}

function countCharacters(components: BuilderTopLevelComponent[]): number {
  let chars = 0;
  for (const c of components) {
    if (c.type === ComponentType.TextDisplay) {
      chars += c.content.length;
    } else if (c.type === ComponentType.Section) {
      for (const child of c.components) {
        chars += child.content.length;
      }
    } else if (c.type === ComponentType.Container) {
      chars += countCharacters(c.components as BuilderTopLevelComponent[]);
    } else if (c.type === ComponentType.ActionRow) {
      for (const child of c.components) {
        if (child.type === ComponentType.Button && child.label) {
          chars += child.label.length;
        }
      }
    }
  }
  return chars;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function stripBuilderIds(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(stripBuilderIds);
  }
  if (obj && typeof obj === "object") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (key === "_builderId") continue;
      if (value === undefined || value === null) continue;

      if (value === false && key !== "divider") continue;
      if (Array.isArray(value) && value.length === 0 && key !== "components") continue;
      cleaned[key] = stripBuilderIds(value);
    }
    return cleaned;
  }
  return obj;
}

export function useComponentsBuilder() {
  const components = ref<BuilderTopLevelComponent[]>([]);
  const selectedId = ref<string | null>(null);

  function findInList(list: BuilderAnyComponent[], id: string): BuilderAnyComponent | null {
    for (const c of list) {
      if (c._builderId === id) return c;
      if (c.type === ComponentType.ActionRow) {
        const found = findInList(c.components, id);
        if (found) return found;
      } else if (c.type === ComponentType.Section) {
        const found = findInList(c.components, id);
        if (found) return found;
        if (c.accessory && c.accessory._builderId === id) return c.accessory;
      } else if (c.type === ComponentType.Container) {
        const found = findInList(c.components as BuilderAnyComponent[], id);
        if (found) return found;
      }
    }
    return null;
  }

  function findComponentById(id: string | null): BuilderAnyComponent | null {
    if (!id) return null;
    return findInList(components.value as BuilderAnyComponent[], id);
  }

  function findParent(list: BuilderAnyComponent[], id: string): { parent: BuilderAnyComponent | null; index: number; list: BuilderAnyComponent[] } | null {
    for (let i = 0; i < list.length; i++) {
      const c = list[i];
      if (c._builderId === id) return { parent: null, index: i, list };
      if (c.type === ComponentType.ActionRow) {
        for (let j = 0; j < c.components.length; j++) {
          if (c.components[j]._builderId === id) return { parent: c, index: j, list: c.components };
        }
      } else if (c.type === ComponentType.Section) {
        for (let j = 0; j < c.components.length; j++) {
          if (c.components[j]._builderId === id) return { parent: c, index: j, list: c.components as BuilderAnyComponent[] };
        }
        if (c.accessory && c.accessory._builderId === id) return { parent: c, index: -1, list: [] };
      } else if (c.type === ComponentType.Container) {
        const found = findParent(c.components as BuilderAnyComponent[], id);
        if (found) return found;
      }
    }
    return null;
  }

  function createComponent(type: ComponentType): BuilderAnyComponent {
    return createComponentFromType(type);
  }

  function addComponent(type: ComponentType, parentId?: string): void {
    if (totalComponents.value >= 40) return;

    const comp = createComponent(type);

    if (parentId) {
      const parent = findComponentById(parentId);
      if (!parent) return;

      if (parent.type === ComponentType.ActionRow) {
        const isSelect = [ComponentType.StringSelect, ComponentType.UserSelect, ComponentType.RoleSelect, ComponentType.MentionableSelect, ComponentType.ChannelSelect].includes(type);
        const hasSelect = parent.components.some((c) =>
          [ComponentType.StringSelect, ComponentType.UserSelect, ComponentType.RoleSelect, ComponentType.MentionableSelect, ComponentType.ChannelSelect].includes(c.type),
        );
        const hasButton = parent.components.some((c) => c.type === ComponentType.Button);
        if (isSelect && (hasButton || hasSelect)) return;
        if (type === ComponentType.Button && hasSelect) return;
        if (parent.components.length >= 5) return;
        parent.components.push(comp as BuilderButtonData);
      } else if (parent.type === ComponentType.Container) {
        if (type === ComponentType.Container) return;
        parent.components.push(comp as Exclude<BuilderTopLevelComponent, BuilderContainerData>);
      } else if (parent.type === ComponentType.Section) {
        if (type === ComponentType.TextDisplay && parent.components.length < 3) {
          parent.components.push(comp as BuilderTextDisplayData);
        }
      }
    } else {
      if (components.value.length >= 10) return;
      components.value.push(comp as BuilderTopLevelComponent);
    }
  }

  function removeComponent(id: string): void {
    if (selectedId.value === id) selectedId.value = null;
    const info = findParent(components.value as BuilderAnyComponent[], id);
    if (!info) return;

    if (info.parent?.type === ComponentType.Section && info.index === -1) {
      (info.parent as BuilderSectionData).accessory = undefined;
      return;
    }
    info.list.splice(info.index, 1);
  }

  function updateComponent(id: string, updates: Record<string, unknown>): void {
    const comp = findComponentById(id);
    if (!comp) return;
    Object.assign(comp, updates);
  }

  function selectComponent(id: string | null): void {
    selectedId.value = selectedId.value === id ? null : id;
  }

  const selectedComponent = computed(() => findComponentById(selectedId.value));

  const totalComponents = computed(() => countComponents(components.value));
  const totalCharacters = computed(() => countCharacters(components.value));

  function getCleanJSON(): string {
    const cleaned = stripBuilderIds(components.value);
    return JSON.stringify(cleaned, null, 2);
  }

  return {
    components,
    selectedId,
    selectedComponent,
    totalComponents,
    totalCharacters,
    addComponent,
    removeComponent,
    updateComponent,
    selectComponent,
    getCleanJSON,
    findComponentById,
    createComponent,
  };
}
