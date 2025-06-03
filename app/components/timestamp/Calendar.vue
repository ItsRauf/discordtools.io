<script setup lang="ts">
import { DatePicker as VCalendarDatePicker } from "v-calendar";
import type {
  DatePickerDate,
  DatePickerRangeObject,
  // @ts-expect-error importing types that aren't explicitly exported but is available
} from "v-calendar/dist/types/src/use/datePicker";
import "v-calendar/dist/style.css";

defineOptions({
  inheritAttrs: false,
});

const props = defineProps({
  modelValue: {
    type: [Date, Object] as PropType<DatePickerDate | null>,
    default: null,
  },
});

const emit = defineEmits(["update:model-value", "close"]);

const date = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit("update:model-value", value);
    emit("close");
  },
});

const attrs = {
  color: "primary",
  "is-dark": true,
  "first-day-of-week": 1,
  mode: "dateTime",
};

function onDayClick(_: unknown, event: MouseEvent): void {
  const target = event.target as HTMLElement;
  target.blur();
}
</script>

<template>
  <VCalendarDatePicker
    v-if="date && (date as DatePickerRangeObject)?.start && (date as DatePickerRangeObject)?.end"
    v-model.range="date"
    :columns="2"
    v-bind="{ ...attrs, ...$attrs }"
    @dayclick="onDayClick"
  />
  <VCalendarDatePicker
    v-else
    v-model="date"
    v-bind="{ ...attrs, ...$attrs }"
    @dayclick="onDayClick"
  />
</template>

<style>
:root {
  --vc-gray-50: var(--color-neutral-50);
  --vc-gray-100: var(--color-neutral-100);
  --vc-gray-200: var(--color-neutral-200);
  --vc-gray-300: var(--color-neutral-300);
  --vc-gray-400: var(--color-neutral-400);
  --vc-gray-500: var(--color-neutral-500);
  --vc-gray-600: var(--color-neutral-600);
  --vc-gray-700: var(--color-neutral-700);
  --vc-gray-800: var(--color-neutral-800);
  --vc-gray-900: var(--color-neutral-900);
  --vc-border: var(--ui-border);
}

.vc-primary {
  --vc-accent-50: var(--color-primary-50);
  --vc-accent-100: var(--color-primary-100);
  --vc-accent-200: var(--color-primary-200);
  --vc-accent-300: var(--color-primary-300);
  --vc-accent-400: var(--color-primary-400);
  --vc-accent-500: var(--color-primary-500);
  --vc-accent-600: var(--color-primary-600);
  --vc-accent-700: var(--color-primary-700);
  --vc-accent-800: var(--color-primary-800);
  --vc-accent-900: var(--color-primary-900);
}
</style>
