<script setup lang="ts">
import tools from "~/assets/data/tools.json";
import { h, resolveComponent } from "vue";
import type { TableColumn } from "@nuxt/ui";
import { useClipboard } from "@vueuse/core";

const route = useRoute();
const tool = tools.find((t) => t.route === route.path);

useEmbed(tool);

definePageMeta({
  layout: "tool",
});

const date = ref(new Date());

const relativeTime = computed(() => {
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const now = Date.now();
  const diffInSeconds = Math.floor((date.value.getTime() - now) / 1000);
  const cutoffs = [60, 3600, 86400, 86400 * 30, 86400 * 365, Infinity];
  const units = ["second", "minute", "hour", "day", "month", "year"];
  const unitIndex = cutoffs.findIndex(
    (cutoff) => cutoff > Math.abs(diffInSeconds)
  );
  const divisor = unitIndex ? cutoffs[unitIndex - 1] : 1;

  // @ts-expect-error Intl does not export the type for the unit keys
  return rtf.format(Math.floor(diffInSeconds / divisor!) + 1, units[unitIndex]);
});

interface TimestampData {
  format: string;
  syntax: string;
  example: string;
}
const data = computed<TimestampData[]>(() => [
  {
    format: "Short Time",
    syntax: `<t:${Math.floor(date.value.getTime() / 1000)}:t>`,
    example: date.value.toLocaleTimeString("en", { timeStyle: "short" }),
  },
  {
    format: "Long Time",
    syntax: `<t:${Math.floor(date.value.getTime() / 1000)}:T>`,
    example: date.value.toLocaleTimeString("en", { timeStyle: "medium" }),
  },
  {
    format: "Short Date",
    syntax: `<t:${Math.floor(date.value.getTime() / 1000)}:d>`,
    example: date.value.toLocaleDateString("en", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    }),
  },
  {
    format: "Long Date",
    syntax: `<t:${Math.floor(date.value.getTime() / 1000)}:D>`,
    example: date.value.toLocaleDateString("en", { dateStyle: "long" }),
  },
  {
    format: "Short Date/Time",
    syntax: `<t:${Math.floor(date.value.getTime() / 1000)}:f>`,
    example: date.value.toLocaleString("en", {
      dateStyle: "long",
      timeStyle: "short",
    }),
  },
  {
    format: "Long Date/Time",
    syntax: `<t:${Math.floor(date.value.getTime() / 1000)}:F>`,
    example: date.value.toLocaleString("en", {
      dateStyle: "full",
      timeStyle: "short",
    }),
  },
  {
    format: "Relative Time",
    syntax: `<t:${Math.floor(date.value.getTime() / 1000)}:R>`,
    example: relativeTime.value,
  },
]);

const source = ref("");
const { copy } = useClipboard({ source });
const toast = useToast();

const clipboardCopy = (text: string) => {
  copy(text);
  toast.add({
    title: "Copied to clipboard!",
    duration: 1500,
  });
};

const UButton = resolveComponent("UButton");
const columns: TableColumn<TimestampData>[] = [
  {
    accessorKey: "format",
    header: "Format",
    cell: ({ row }) => row.getValue("format"),
  },
  {
    accessorKey: "syntax",
    header: "Syntax",
    cell: ({ row }) =>
      h(
        UButton,
        {
          variant: "ghost",
          color: "primary",
          onClick: () => clipboardCopy(row.getValue("syntax")),
        },
        () => row.getValue("syntax")
      ),
  },
  {
    accessorKey: "example",
    header: "Example",
    cell: ({ row }) => row.getValue("example"),
  },
];
</script>

<template>
  <UCard variant="outline">
    <template #header>
      <h1 class="text-4xl text-highlighted font-bold">{{ tool?.name }}</h1>
      <p class="text-pretty">{{ tool?.description }}</p>
    </template>
    <UCard variant="soft">
      <div class="flex sm:flex-row flex-col gap-4">
        <div class="flex justify-center items-stretch">
          <TimestampCalendar v-model="date" is-required />
        </div>
        <UCard class="flex-1">
          <UTable :data="data" :columns="columns" />
        </UCard>
      </div>
    </UCard>
  </UCard>
</template>
