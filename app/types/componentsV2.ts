import {
  ComponentType,
  ButtonStyle,
  SeparatorSpacingSize,
} from "discord-api-types/v10";

export { ComponentType, ButtonStyle, SeparatorSpacingSize };

interface WithBuilderId {
  _builderId: string;
}

export interface BuilderTextDisplayData extends WithBuilderId {
  type: ComponentType.TextDisplay;
  content: string;
}

export interface BuilderButtonData extends WithBuilderId {
  type: ComponentType.Button;
  style: ButtonStyle;
  label?: string;
  custom_id?: string;
  url?: string;
  disabled?: boolean;
}

export interface BuilderSelectOption {
  _builderId: string;
  label: string;
  value: string;
  description?: string;
  default?: boolean;
}

export interface BuilderStringSelectData extends WithBuilderId {
  type: ComponentType.StringSelect;
  custom_id: string;
  placeholder?: string;
  min_values?: number;
  max_values?: number;
  disabled?: boolean;
  options: BuilderSelectOption[];
}

export interface BuilderUserSelectData extends WithBuilderId {
  type: ComponentType.UserSelect;
  custom_id: string;
  placeholder?: string;
  disabled?: boolean;
}

export interface BuilderRoleSelectData extends WithBuilderId {
  type: ComponentType.RoleSelect;
  custom_id: string;
  placeholder?: string;
  disabled?: boolean;
}

export interface BuilderMentionableSelectData extends WithBuilderId {
  type: ComponentType.MentionableSelect;
  custom_id: string;
  placeholder?: string;
  disabled?: boolean;
}

export interface BuilderChannelSelectData extends WithBuilderId {
  type: ComponentType.ChannelSelect;
  custom_id: string;
  placeholder?: string;
  disabled?: boolean;
}

export interface BuilderUnfurledMediaItem {
  url: string;
}

export interface BuilderMediaGalleryItem {
  _builderId: string;
  media: BuilderUnfurledMediaItem;
  description?: string;
  spoiler?: boolean;
}

export interface BuilderThumbnailData extends WithBuilderId {
  type: ComponentType.Thumbnail;
  media: BuilderUnfurledMediaItem;
  description?: string;
  spoiler?: boolean;
}

export interface BuilderMediaGalleryData extends WithBuilderId {
  type: ComponentType.MediaGallery;
  items: BuilderMediaGalleryItem[];
}

export interface BuilderFileData extends WithBuilderId {
  type: ComponentType.File;
  file: BuilderUnfurledMediaItem;
  spoiler?: boolean;
}

export interface BuilderSeparatorData extends WithBuilderId {
  type: ComponentType.Separator;
  divider?: boolean;
  spacing?: SeparatorSpacingSize;
}

export type BuilderActionRowChild =
  | BuilderButtonData
  | BuilderStringSelectData
  | BuilderUserSelectData
  | BuilderRoleSelectData
  | BuilderMentionableSelectData
  | BuilderChannelSelectData;

export interface BuilderActionRowData extends WithBuilderId {
  type: ComponentType.ActionRow;
  components: BuilderActionRowChild[];
}

export interface BuilderSectionData extends WithBuilderId {
  type: ComponentType.Section;
  components: BuilderTextDisplayData[];
  accessory?: BuilderThumbnailData | BuilderButtonData;
}

export type BuilderTopLevelComponent =
  | BuilderActionRowData
  | BuilderSectionData
  | BuilderTextDisplayData
  | BuilderMediaGalleryData
  | BuilderFileData
  | BuilderSeparatorData
  | BuilderContainerData;

export interface BuilderContainerData extends WithBuilderId {
  type: ComponentType.Container;
  accent_color?: number;
  spoiler?: boolean;
  components: Exclude<BuilderTopLevelComponent, BuilderContainerData>[];
}

export type BuilderAnyComponent =
  | BuilderTopLevelComponent
  | BuilderButtonData
  | BuilderStringSelectData
  | BuilderUserSelectData
  | BuilderRoleSelectData
  | BuilderMentionableSelectData
  | BuilderChannelSelectData
  | BuilderThumbnailData;

export const componentTypeLabels: Partial<Record<ComponentType, string>> = {
  [ComponentType.ActionRow]: "Action Row",
  [ComponentType.Button]: "Button",
  [ComponentType.StringSelect]: "String Select",
  [ComponentType.TextInput]: "Text Input",
  [ComponentType.UserSelect]: "User Select",
  [ComponentType.RoleSelect]: "Role Select",
  [ComponentType.MentionableSelect]: "Mentionable Select",
  [ComponentType.ChannelSelect]: "Channel Select",
  [ComponentType.Section]: "Section",
  [ComponentType.TextDisplay]: "Text Display",
  [ComponentType.Thumbnail]: "Thumbnail",
  [ComponentType.MediaGallery]: "Media Gallery",
  [ComponentType.File]: "File",
  [ComponentType.Separator]: "Separator",
  [ComponentType.Container]: "Container",
};

export const componentTypeIcons: Partial<Record<ComponentType, string>> = {
  [ComponentType.ActionRow]: "ph:rows-duotone",
  [ComponentType.Button]: "ph:cursor-click-duotone",
  [ComponentType.StringSelect]: "ph:list-bullets-duotone",
  [ComponentType.TextInput]: "ph:textbox-duotone",
  [ComponentType.UserSelect]: "ph:user-duotone",
  [ComponentType.RoleSelect]: "ph:shield-duotone",
  [ComponentType.MentionableSelect]: "ph:at-duotone",
  [ComponentType.ChannelSelect]: "ph:hash-duotone",
  [ComponentType.Section]: "ph:columns-duotone",
  [ComponentType.TextDisplay]: "ph:text-t-duotone",
  [ComponentType.Thumbnail]: "ph:image-duotone",
  [ComponentType.MediaGallery]: "ph:images-duotone",
  [ComponentType.File]: "ph:file-duotone",
  [ComponentType.Separator]: "ph:minus-duotone",
  [ComponentType.Container]: "ph:square-duotone",
};

export const componentCategories = {
  Layout: [ComponentType.Container, ComponentType.Section, ComponentType.ActionRow],
  Content: [ComponentType.TextDisplay, ComponentType.MediaGallery, ComponentType.Thumbnail, ComponentType.File, ComponentType.Separator],
  Interactive: [ComponentType.Button, ComponentType.StringSelect, ComponentType.UserSelect, ComponentType.RoleSelect, ComponentType.MentionableSelect, ComponentType.ChannelSelect],
} as const;

export const interactiveTypes: readonly ComponentType[] = [
  ComponentType.Button,
  ComponentType.StringSelect,
  ComponentType.UserSelect,
  ComponentType.RoleSelect,
  ComponentType.MentionableSelect,
  ComponentType.ChannelSelect,
];

export const selectTypes: readonly ComponentType[] = [
  ComponentType.StringSelect,
  ComponentType.UserSelect,
  ComponentType.RoleSelect,
  ComponentType.MentionableSelect,
  ComponentType.ChannelSelect,
];
