import {
  ApplicationCommandOptionType,
  ChannelType,
  type ApplicationCommand,
  type ApplicationCommandOption,
  type ApplicationCommandOptionChoice,
} from "~/types/slashCommand";

function uid(): string {
  return crypto.randomUUID();
}

function findOptionById(
  options: ApplicationCommandOption[],
  id: string,
): ApplicationCommandOption | undefined {
  for (const opt of options) {
    if (opt.id === id) return opt;
    if (opt.options) {
      const found = findOptionById(opt.options, id);
      if (found) return found;
    }
  }
  return undefined;
}

function removeOptionById(
  options: ApplicationCommandOption[],
  id: string,
): boolean {
  const idx = options.findIndex((o) => o.id === id);
  if (idx !== -1) {
    options.splice(idx, 1);
    return true;
  }
  for (const opt of options) {
    if (opt.options && removeOptionById(opt.options, id)) return true;
  }
  return false;
}

function cleanOption(opt: ApplicationCommandOption): Record<string, unknown> {
  const out: Record<string, unknown> = {
    type: opt.type,
    name: opt.name,
    description: opt.description,
  };
  if (opt.required) out.required = true;
  if (opt.choices && opt.choices.length > 0) {
    out.choices = opt.choices.map((c) => ({ name: c.name, value: c.value }));
  }
  if (opt.options && opt.options.length > 0) {
    out.options = opt.options.map(cleanOption);
  }
  if (opt.channel_types && opt.channel_types.length > 0) {
    out.channel_types = opt.channel_types;
  }
  if (opt.min_value !== undefined) out.min_value = opt.min_value;
  if (opt.max_value !== undefined) out.max_value = opt.max_value;
  if (opt.min_length !== undefined) out.min_length = opt.min_length;
  if (opt.max_length !== undefined) out.max_length = opt.max_length;
  if (opt.autocomplete) out.autocomplete = true;
  return out;
}

function escapeJs(str: string): string {
  return str.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

function escapePy(str: string): string {
  return str.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

const pyChannelTypeMap: Record<number, string> = {
  [ChannelType.GuildText]: "text",
  [ChannelType.GuildVoice]: "voice",
  [ChannelType.GuildCategory]: "category",
  [ChannelType.GuildAnnouncement]: "news",
  [ChannelType.GuildStageVoice]: "stage_voice",
  [ChannelType.GuildForum]: "forum",
  [ChannelType.GuildMedia]: "media",
};

const djsMethodMap: Record<ApplicationCommandOptionType, string> = {
  [ApplicationCommandOptionType.Subcommand]: "addSubcommand",
  [ApplicationCommandOptionType.SubcommandGroup]: "addSubcommandGroup",
  [ApplicationCommandOptionType.String]: "addStringOption",
  [ApplicationCommandOptionType.Integer]: "addIntegerOption",
  [ApplicationCommandOptionType.Boolean]: "addBooleanOption",
  [ApplicationCommandOptionType.User]: "addUserOption",
  [ApplicationCommandOptionType.Channel]: "addChannelOption",
  [ApplicationCommandOptionType.Role]: "addRoleOption",
  [ApplicationCommandOptionType.Mentionable]: "addMentionableOption",
  [ApplicationCommandOptionType.Number]: "addNumberOption",
  [ApplicationCommandOptionType.Attachment]: "addAttachmentOption",
};

function genDjsOption(opt: ApplicationCommandOption, depth: number): string {
  const pad = "  ".repeat(depth);
  const isSubCmd = opt.type === ApplicationCommandOptionType.Subcommand;
  const isSubGroup = opt.type === ApplicationCommandOptionType.SubcommandGroup;
  const method = djsMethodMap[opt.type];
  const paramName = isSubCmd ? "sub" : isSubGroup ? "group" : "option";

  let inner = `${paramName}.setName('${escapeJs(opt.name)}')\n${pad}    .setDescription('${escapeJs(opt.description)}')`;

  if (!isSubCmd && !isSubGroup && opt.required) {
    inner += `\n${pad}    .setRequired(true)`;
  }

  if (opt.type === ApplicationCommandOptionType.String) {
    if (opt.min_length !== undefined)
      inner += `\n${pad}    .setMinLength(${opt.min_length})`;
    if (opt.max_length !== undefined)
      inner += `\n${pad}    .setMaxLength(${opt.max_length})`;
  }

  if (
    opt.type === ApplicationCommandOptionType.Integer ||
    opt.type === ApplicationCommandOptionType.Number
  ) {
    if (opt.min_value !== undefined)
      inner += `\n${pad}    .setMinValue(${opt.min_value})`;
    if (opt.max_value !== undefined)
      inner += `\n${pad}    .setMaxValue(${opt.max_value})`;
  }

  if (
    opt.type === ApplicationCommandOptionType.Channel &&
    opt.channel_types &&
    opt.channel_types.length > 0
  ) {
    const ctypes = opt.channel_types.map((ct) => `ChannelType.${ChannelType[ct] ?? ct}`).join(", ");
    inner += `\n${pad}    .addChannelTypes(${ctypes})`;
  }

  if (opt.autocomplete) {
    inner += `\n${pad}    .setAutocomplete(true)`;
  }

  if (opt.choices && opt.choices.length > 0 && !opt.autocomplete) {
    const choicesStr = opt.choices
      .map((c) => {
        const val = typeof c.value === "number" ? c.value : `'${escapeJs(String(c.value))}'`;
        return `{ name: '${escapeJs(c.name)}', value: ${val} }`;
      })
      .join(", ");
    inner += `\n${pad}    .addChoices(${choicesStr})`;
  }

  if ((isSubCmd || isSubGroup) && opt.options && opt.options.length > 0) {
    for (const nested of opt.options) {
      inner += `\n${pad}    .${genDjsOption(nested, depth + 2)}`;
    }
  }

  return `${method}(${paramName} =>\n${pad}    ${inner})`;
}

function generateDjsCode(cmd: ApplicationCommand): string {
  let needsChannelType = false;
  const checkChannelTypes = (opts: ApplicationCommandOption[]) => {
    for (const o of opts) {
      if (o.channel_types && o.channel_types.length > 0) needsChannelType = true;
      if (o.options) checkChannelTypes(o.options);
    }
  };
  checkChannelTypes(cmd.options);

  const imports = needsChannelType
    ? "const { SlashCommandBuilder, ChannelType } = require('discord.js');"
    : "const { SlashCommandBuilder } = require('discord.js');";

  let code = `${imports}\n\nconst command = new SlashCommandBuilder()\n  .setName('${escapeJs(cmd.name)}')\n  .setDescription('${escapeJs(cmd.description)}')`;

  for (const opt of cmd.options) {
    code += `\n  .${genDjsOption(opt, 1)}`;
  }

  code += ";";
  return code;
}

const pyTypeMap: Record<ApplicationCommandOptionType, string> = {
  [ApplicationCommandOptionType.Subcommand]: "",
  [ApplicationCommandOptionType.SubcommandGroup]: "",
  [ApplicationCommandOptionType.String]: "str",
  [ApplicationCommandOptionType.Integer]: "int",
  [ApplicationCommandOptionType.Boolean]: "bool",
  [ApplicationCommandOptionType.User]: "discord.User",
  [ApplicationCommandOptionType.Channel]: "discord.abc.GuildChannel",
  [ApplicationCommandOptionType.Role]: "discord.Role",
  [ApplicationCommandOptionType.Mentionable]: "discord.User | discord.Role",
  [ApplicationCommandOptionType.Number]: "float",
  [ApplicationCommandOptionType.Attachment]: "discord.Attachment",
};

function generatePyCode(cmd: ApplicationCommand): string {
  const hasSubCommands = cmd.options.some(
    (o) =>
      o.type === ApplicationCommandOptionType.Subcommand ||
      o.type === ApplicationCommandOptionType.SubcommandGroup,
  );

  if (hasSubCommands) {
    return generatePyGroupCode(cmd);
  }

  return generatePySimpleCode(cmd);
}

function generatePySimpleCode(cmd: ApplicationCommand): string {
  let code = "import discord\nfrom discord import app_commands\n\n";
  const requiredOpts = cmd.options.filter((o) => o.required);
  const optionalOpts = cmd.options.filter((o) => !o.required);
  const sortedOpts = [...requiredOpts, ...optionalOpts];

  const decorators: string[] = [];
  decorators.push(
    `@app_commands.command(name="${escapePy(cmd.name)}", description="${escapePy(cmd.description)}")`,
  );

  if (sortedOpts.length > 0) {
    const descParts = sortedOpts
      .map((o) => `${o.name}="${escapePy(o.description)}"`)
      .join(", ");
    decorators.push(`@app_commands.describe(${descParts})`);
  }

  for (const opt of sortedOpts) {
    if (opt.choices && opt.choices.length > 0 && !opt.autocomplete) {
      const choiceParts = opt.choices
        .map((c) => {
          const val = typeof c.value === "number" ? c.value : `"${escapePy(String(c.value))}"`;
          return `app_commands.Choice(name="${escapePy(c.name)}", value=${val})`;
        })
        .join(", ");
      decorators.push(`@app_commands.choices(${opt.name}=[${choiceParts}])`);
    }
    if (
      opt.type === ApplicationCommandOptionType.Channel &&
      opt.channel_types &&
      opt.channel_types.length > 0
    ) {
      const ctypes = opt.channel_types
        .map((ct) => `discord.ChannelType.${pyChannelTypeMap[ct] ?? ct}`)
        .join(", ");
      decorators.push(
        `@app_commands.guild_channel_types(${ctypes})`,
      );
    }
  }

  code += decorators.join("\n") + "\n";

  const params = ["interaction: discord.Interaction"];
  for (const opt of sortedOpts) {
    let typeAnnotation = pyTypeMap[opt.type] || "str";
    if (hasRange(opt)) {
      typeAnnotation = buildRangeAnnotation(opt);
    }
    if (opt.required) {
      params.push(`${opt.name}: ${typeAnnotation}`);
    } else {
      params.push(`${opt.name}: ${typeAnnotation} = None`);
    }
  }

  const fnName = cmd.name.replace(/-/g, "_");
  code += `async def ${fnName}(${params.join(", ")}):\n    ...`;
  return code;
}

function hasRange(opt: ApplicationCommandOption): boolean {
  return (
    opt.min_value !== undefined ||
    opt.max_value !== undefined ||
    opt.min_length !== undefined ||
    opt.max_length !== undefined
  );
}

function buildRangeAnnotation(opt: ApplicationCommandOption): string {
  const baseType = pyTypeMap[opt.type] || "str";
  if (
    opt.type === ApplicationCommandOptionType.String &&
    (opt.min_length !== undefined || opt.max_length !== undefined)
  ) {
    const min = opt.min_length !== undefined ? opt.min_length : "None";
    const max = opt.max_length !== undefined ? opt.max_length : "None";
    return `app_commands.Range[${baseType}, ${min}, ${max}]`;
  }
  if (
    (opt.type === ApplicationCommandOptionType.Integer ||
      opt.type === ApplicationCommandOptionType.Number) &&
    (opt.min_value !== undefined || opt.max_value !== undefined)
  ) {
    const min = opt.min_value !== undefined ? opt.min_value : "None";
    const max = opt.max_value !== undefined ? opt.max_value : "None";
    return `app_commands.Range[${baseType}, ${min}, ${max}]`;
  }
  return baseType;
}

function generatePyGroupCode(cmd: ApplicationCommand): string {
  let code = "import discord\nfrom discord import app_commands\n\n";
  const className = cmd.name
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");

  code += `class ${className}Group(app_commands.Group):\n`;

  for (const opt of cmd.options) {
    if (opt.type === ApplicationCommandOptionType.SubcommandGroup) {
      code += generatePySubGroupCode(opt, 1);
    } else if (opt.type === ApplicationCommandOptionType.Subcommand) {
      code += generatePySubCommandCode(opt, 1);
    }
  }

  return code;
}

function generatePySubCommandCode(
  opt: ApplicationCommandOption,
  indentLevel: number,
): string {
  const pad = "    ".repeat(indentLevel);
  let code = "";
  const requiredOpts = (opt.options || []).filter((o) => o.required);
  const optionalOpts = (opt.options || []).filter((o) => !o.required);
  const sortedOpts = [...requiredOpts, ...optionalOpts];

  code += `${pad}@app_commands.command(name="${escapePy(opt.name)}", description="${escapePy(opt.description)}")\n`;

  if (sortedOpts.length > 0) {
    const descParts = sortedOpts
      .map((o) => `${o.name}="${escapePy(o.description)}"`)
      .join(", ");
    code += `${pad}@app_commands.describe(${descParts})\n`;
  }

  const params = ["self", "interaction: discord.Interaction"];
  for (const o of sortedOpts) {
    let typeAnnotation = pyTypeMap[o.type] || "str";
    if (hasRange(o)) typeAnnotation = buildRangeAnnotation(o);
    if (o.required) {
      params.push(`${o.name}: ${typeAnnotation}`);
    } else {
      params.push(`${o.name}: ${typeAnnotation} = None`);
    }
  }

  const fnName = opt.name.replace(/-/g, "_");
  code += `${pad}async def ${fnName}(${params.join(", ")}):\n${pad}    ...\n\n`;
  return code;
}

function generatePySubGroupCode(
  opt: ApplicationCommandOption,
  indentLevel: number,
): string {
  const pad = "    ".repeat(indentLevel);
  const className = opt.name
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");

  let code = `\n${pad}class ${className}SubGroup(app_commands.Group):\n`;
  for (const sub of opt.options || []) {
    code += generatePySubCommandCode(sub, indentLevel + 1);
  }
  return code;
}

export function useSlashCommand() {
  const command = ref<ApplicationCommand>({
    name: "",
    description: "",
    options: [],
  });

  function addOption(
    type: ApplicationCommandOptionType,
    parentId?: string,
  ) {
    const newOption: ApplicationCommandOption = {
      id: uid(),
      type,
      name: "",
      description: "",
      required: false,
      ...(type === ApplicationCommandOptionType.Subcommand ||
      type === ApplicationCommandOptionType.SubcommandGroup
        ? { options: [] }
        : {}),
      ...([
        ApplicationCommandOptionType.String,
        ApplicationCommandOptionType.Integer,
        ApplicationCommandOptionType.Number,
      ].includes(type)
        ? { choices: [] }
        : {}),
      ...(type === ApplicationCommandOptionType.Channel
        ? { channel_types: [] }
        : {}),
    };

    if (parentId) {
      const parent = findOptionById(command.value.options, parentId);
      if (parent) {
        if (!parent.options) parent.options = [];
        parent.options.push(newOption);
      }
    } else {
      command.value.options.push(newOption);
    }
  }

  function updateOption(
    id: string,
    updates: Partial<ApplicationCommandOption>,
  ) {
    const opt = findOptionById(command.value.options, id);
    if (opt) {
      Object.assign(opt, updates);
    }
  }

  function removeOption(id: string) {
    removeOptionById(command.value.options, id);
  }

  function reorderOptions(
    parentId: string | null,
    fromIndex: number,
    toIndex: number,
  ) {
    let list: ApplicationCommandOption[];
    if (parentId) {
      const parent = findOptionById(command.value.options, parentId);
      if (!parent || !parent.options) return;
      list = parent.options;
    } else {
      list = command.value.options;
    }
    const [moved] = list.splice(fromIndex, 1);
    if (moved) list.splice(toIndex, 0, moved);
  }

  function addChoice(optionId: string) {
    const opt = findOptionById(command.value.options, optionId);
    if (opt) {
      if (!opt.choices) opt.choices = [];
      opt.choices.push({ id: uid(), name: "", value: "" });
    }
  }

  function updateChoice(
    optionId: string,
    choiceId: string,
    updates: Partial<ApplicationCommandOptionChoice>,
  ) {
    const opt = findOptionById(command.value.options, optionId);
    if (opt?.choices) {
      const choice = opt.choices.find((c) => c.id === choiceId);
      if (choice) Object.assign(choice, updates);
    }
  }

  function removeChoice(optionId: string, choiceId: string) {
    const opt = findOptionById(command.value.options, optionId);
    if (opt?.choices) {
      const idx = opt.choices.findIndex((c) => c.id === choiceId);
      if (idx !== -1) opt.choices.splice(idx, 1);
    }
  }

  function getCleanJSON(): string {
    const cleaned: Record<string, unknown> = {
      name: command.value.name,
      description: command.value.description,
    };
    if (command.value.options.length > 0) {
      cleaned.options = command.value.options.map(cleanOption);
    }
    return JSON.stringify(cleaned, null, 2);
  }

  function getDiscordJSCode(): string {
    return generateDjsCode(command.value);
  }

  function getDiscordPyCode(): string {
    return generatePyCode(command.value);
  }

  return {
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
  };
}
