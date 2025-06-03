<script setup lang="ts">
import tools from "~/assets/data/tools.json"

const route = useRoute();
const tool = tools.find(t => t.route === route.path);

useEmbed(tool)

definePageMeta({
  layout: "tool",
});

const image = ref<FileReader["result"]>();

function handleFileSelect(e: Event) {
  const target = e?.target as HTMLInputElement;
  const reader = new FileReader();
  reader.readAsDataURL(target.files!.item(0) as Blob);
  reader.onload = (e) => image.value = e.target!.result;
}
</script>

<template>
  <UCard variant="outline">
    <template #header>
      <h1 class="text-4xl text-highlighted font-bold">{{ tool?.name }}</h1>
      <p class="text-pretty">{{ tool?.description }}</p>
    </template>
    <UCard variant="soft">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        data-name="blob"
        viewBox="0 0 48 48"
        class="sr-only"
      >
        <defs>
          <clipPath
            id="squircle"
            clipPathUnits="objectBoundingBox"
            transform="scale(0.020833 0.020833)"
          >
            <path
              d="M0 24c0-7.46 0-11.18 1.22-14.12a15.98 15.98 0 0 1 8.66-8.66C12.82 0 16.55 0 24 0s11.18 0 14.12 1.22a15.98 15.98 0 0 1 8.66 8.66C48 12.82 48 16.55 48 24s0 11.18-1.22 14.12a15.98 15.98 0 0 1-8.66 8.66C35.18 48 31.45 48 24 48s-11.18 0-14.12-1.22a15.98 15.98 0 0 1-8.66-8.66C0 35.18 0 31.45 0 24Z"
            />
          </clipPath>
        </defs>
      </svg>
      <div class="flex flex-col items-center justify-center gap-16 pt-24 pb-16">
        <div class="flex gap-16 ml-2">
          <figure class="flex flex-col gap-4 items-center">
            <div class="w-32 h-32 md:w-48 md:h-48 lg:w-64 lg:h-64 bg-primary-400 rounded-full">
              <NuxtImg
                v-if="image"
                :src="image.toString()"
                alt="user uploaded"
                class="w-full h-full object-cover rounded-full"
              />
            </div>
            <figcaption class="text-xl font-semibold dark:text-white">
              Rounded
            </figcaption>
          </figure>
          <figure class="flex flex-col gap-4 items-center">
            <div class="w-32 h-32 md:w-48 md:h-48 lg:w-64 lg:h-64 bg-primary-400 [clip-path:_url(#squircle)]">
              <NuxtImg
                v-if="image"
                :src="image.toString()"
                alt="user uploaded"
                class="w-full h-full object-cover"
              />
            </div>
            <figcaption class="text-xl font-semibold dark:text-white">
              Squircle
            </figcaption>
          </figure>
        </div>
        <div class="flex gap-4">
          <label
            for="file-upload"
            class="inline-flex items-center justify-center dark:text-stone-100 border-2 border-primary-400 hover:border-primary-500 bg-primary-400/25 hover:bg-primary-500/50 transition-all duration-150 ease-in-out px-4 py-2 rounded-full hover:cursor-pointer text-lg font-semibold"
          >
            Upload Image
          </label>
          <UButton
            color="error"
            :disabled="!image"
            leading-icon="ph:trash-simple-duotone"
            size="xl"
            variant="soft"
            @click="() => { image = undefined }"
          >
            Remove Image
          </UButton>
        </div>
        <input
          id="file-upload"
          type="file"
          class="hidden"
          accept=".jpg, .jpeg, .png"
          @change="handleFileSelect"
        >
      </div>
    </UCard>
  </UCard>
</template>
