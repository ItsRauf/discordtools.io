export enum ApplicationCommandOptionType {
  SubCommand = 1,
  SubCommandGroup = 2,
  String = 3,
  Integer = 4,
  Boolean = 5,
  User = 6,
  Channel = 7,
  Role = 8,
  Mentionable = 9,
  Number = 10,
  Attachment = 11,
}

export enum ChannelType {
  GuildText = 0,
  DM = 1,
  GuildVoice = 2,
  GroupDM = 3,
  GuildCategory = 4,
  GuildAnnouncement = 5,
  GuildStageVoice = 13,
  GuildForum = 15,
  GuildMedia = 16,
}

export interface ApplicationCommandOptionChoice {
  id: string;
  name: string;
  value: string | number;
}

export interface ApplicationCommandOption {
  id: string;
  type: ApplicationCommandOptionType;
  name: string;
  description: string;
  required?: boolean;
  choices?: ApplicationCommandOptionChoice[];
  options?: ApplicationCommandOption[];
  channel_types?: ChannelType[];
  min_value?: number;
  max_value?: number;
  min_length?: number;
  max_length?: number;
  autocomplete?: boolean;
}

export interface ApplicationCommand {
  name: string;
  description: string;
  options: ApplicationCommandOption[];
}

export const optionTypeLabels: Record<ApplicationCommandOptionType, string> = {
  [ApplicationCommandOptionType.SubCommand]: "Sub Command",
  [ApplicationCommandOptionType.SubCommandGroup]: "Sub Command Group",
  [ApplicationCommandOptionType.String]: "String",
  [ApplicationCommandOptionType.Integer]: "Integer",
  [ApplicationCommandOptionType.Boolean]: "Boolean",
  [ApplicationCommandOptionType.User]: "User",
  [ApplicationCommandOptionType.Channel]: "Channel",
  [ApplicationCommandOptionType.Role]: "Role",
  [ApplicationCommandOptionType.Mentionable]: "Mentionable",
  [ApplicationCommandOptionType.Number]: "Number",
  [ApplicationCommandOptionType.Attachment]: "Attachment",
};

export const optionTypeIcons: Record<ApplicationCommandOptionType, string> = {
  [ApplicationCommandOptionType.SubCommand]: "ph:terminal-window-duotone",
  [ApplicationCommandOptionType.SubCommandGroup]: "ph:folder-duotone",
  [ApplicationCommandOptionType.String]: "ph:text-aa-duotone",
  [ApplicationCommandOptionType.Integer]: "ph:hash-duotone",
  [ApplicationCommandOptionType.Boolean]: "ph:toggle-right-duotone",
  [ApplicationCommandOptionType.User]: "ph:user-duotone",
  [ApplicationCommandOptionType.Channel]: "ph:chat-circle-duotone",
  [ApplicationCommandOptionType.Role]: "ph:shield-star-duotone",
  [ApplicationCommandOptionType.Mentionable]: "ph:at-duotone",
  [ApplicationCommandOptionType.Number]: "ph:number-circle-nine-duotone",
  [ApplicationCommandOptionType.Attachment]: "ph:paperclip-duotone",
};

export const optionTypeColors: Record<ApplicationCommandOptionType, string> = {
  [ApplicationCommandOptionType.SubCommand]: "info",
  [ApplicationCommandOptionType.SubCommandGroup]: "info",
  [ApplicationCommandOptionType.String]: "success",
  [ApplicationCommandOptionType.Integer]: "warning",
  [ApplicationCommandOptionType.Boolean]: "neutral",
  [ApplicationCommandOptionType.User]: "primary",
  [ApplicationCommandOptionType.Channel]: "success",
  [ApplicationCommandOptionType.Role]: "error",
  [ApplicationCommandOptionType.Mentionable]: "primary",
  [ApplicationCommandOptionType.Number]: "warning",
  [ApplicationCommandOptionType.Attachment]: "neutral",
};

export const channelTypeLabels: Record<number, string> = {
  [ChannelType.GuildText]: "Text",
  [ChannelType.GuildVoice]: "Voice",
  [ChannelType.GuildCategory]: "Category",
  [ChannelType.GuildAnnouncement]: "Announcement",
  [ChannelType.GuildStageVoice]: "Stage Voice",
  [ChannelType.GuildForum]: "Forum",
  [ChannelType.GuildMedia]: "Media",
};
