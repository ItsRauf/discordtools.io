<script setup lang="ts">
import { useClipboard } from "@vueuse/core";

const builder = inject<ReturnType<typeof useComponentsBuilder>>("builder")!;

const jsonOutput = computed(() => builder.getCleanJSON());

const source = ref("");
const { copy } = useClipboard({ source });
const toast = useToast();

const copyJson = () => {
  copy(jsonOutput.value);
  toast.add({ title: "Copied to clipboard!", duration: 1500 });
};
</script>

<template>
  <UCard variant="soft">
    <template #header>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <h3 class="font-semibold text-highlighted">JSON Output</h3>
          <span class="text-xs text-muted">
            {{ builder.totalComponents.value }}/40 components · {{ builder.totalCharacters.value }}/4000 characters
          </span>
        </div>
        <UButton
          variant="ghost"
          icon="ph:copy-duotone"
          size="sm"
          @click="copyJson"
        >
          Copy
        </UButton>
      </div>
    </template>
    <pre class="text-sm font-mono overflow-x-auto p-4 bg-elevated rounded-lg max-h-96 overflow-y-auto"><code>{{ jsonOutput }}</code></pre>
  </UCard>
</template>
