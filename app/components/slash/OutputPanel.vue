<script setup lang="ts">
import { useClipboard } from "@vueuse/core";

const props = defineProps<{
  getCleanJson: () => string;
  getDiscordJsCode: () => string;
  getDiscordPyCode: () => string;
}>();

const source = ref("");
const { copy } = useClipboard({ source });
const toast = useToast();

function clipboardCopy(text: string) {
  copy(text);
  toast.add({
    title: "Copied to clipboard!",
    duration: 1500,
  });
}

const jsonOutput = computed(() => props.getCleanJson());
const djsOutput = computed(() => props.getDiscordJsCode());
const pyOutput = computed(() => props.getDiscordPyCode());

const tabs = [
  { label: "JSON", value: "json", icon: "ph:brackets-curly-duotone" },
  { label: "discord.js", value: "djs", icon: "ph:file-js-duotone" },
  { label: "discord.py", value: "dpy", icon: "ph:file-py-duotone" },
];

const activeTab = ref("json");

const currentOutput = computed(() => {
  if (activeTab.value === "json") return jsonOutput.value;
  if (activeTab.value === "djs") return djsOutput.value;
  return pyOutput.value;
});
</script>

<template>
  <UCard variant="soft" class="h-fit lg:sticky lg:top-8">
    <div class="flex flex-col gap-3">
      <div class="flex items-center justify-between">
        <span class="text-sm font-semibold text-highlighted">Output</span>
        <UButton
          icon="ph:copy-duotone"
          size="xs"
          variant="soft"
          @click="clipboardCopy(currentOutput)"
        >
          Copy
        </UButton>
      </div>

      <UTabs
        :items="tabs"
        :model-value="activeTab"
        variant="link"
        @update:model-value="(val) => activeTab = val as string"
      />

      <div class="relative">
        <pre
          class="bg-elevated rounded-lg p-4 text-xs font-mono overflow-x-auto max-h-[600px] overflow-y-auto whitespace-pre-wrap break-words"
        ><code>{{ currentOutput }}</code></pre>
      </div>
    </div>
  </UCard>
</template>
