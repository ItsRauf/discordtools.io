<script setup lang="ts">
const { signOut } = useAuth();
</script>

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
      <UButton
        variant="link"
        trailing-icon="ph:sign-out"
        color="error"
        @click="signOut({ callbackUrl: '/' })"
      >
        Sign Out
      </UButton>
    </div>
    <slot />
  </div>
</template>
