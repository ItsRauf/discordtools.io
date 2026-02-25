export { ApplicationCommandOptionType, ChannelType } from "discord-api-types/v10";
import { ApplicationCommandOptionType, ChannelType } from "discord-api-types/v10";

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
  [ApplicationCommandOptionType.Subcommand]: "Sub Command",
  [ApplicationCommandOptionType.SubcommandGroup]: "Sub Command Group",
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
  [ApplicationCommandOptionType.Subcommand]: "ph:terminal-window-duotone",
  [ApplicationCommandOptionType.SubcommandGroup]: "ph:folder-duotone",
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
  [ApplicationCommandOptionType.Subcommand]: "info",
  [ApplicationCommandOptionType.SubcommandGroup]: "info",
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
