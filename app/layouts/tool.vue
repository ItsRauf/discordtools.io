<template>
  <div class="min-h-screen text-default font-sans w-full p-8 flex flex-col gap-4">
    <div class="flex justify-between">
      <NuxtLink to="/">
        <UButton
          variant="soft"
          icon="ph:arrow-u-up-left"
          color="neutral"
        >
          Return to home
        </UButton>
      </NuxtLink>
    </div>
    <slot />
  </div>
</template>
