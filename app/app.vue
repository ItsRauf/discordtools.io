<script setup lang="ts">
useHead({
  link: [{
    rel: "icon",
    type: "image/png",
    href: "/icon/favicon-96x96.png",
    sizes: "96x96"
  }, {
    rel: "icon",
    type: "image/svg+xml",
    href: "/icon/favicon.svg"
  }, {
    rel: "shortcut icon",
    href: "/icon/favicon.ico"
  }, {
    rel: "apple-touch-icon",
    sizes: "180x180",
    href: "/icon/apple-touch-icon.png"
  }, {
    rel: "manifest",
    href: "/icon/site.webmanifest"
  }],
  meta: [{
    name: "apple-mobile-web-app-title",
    content: "discordtools.io"
  }]
})
</script>

<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
