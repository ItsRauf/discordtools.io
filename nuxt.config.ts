// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: [
    "@nuxt/ui",
    "@nuxt/eslint",
    "@nuxt/fonts",
    "@nuxt/icon",
    "@nuxt/image",
    "@sidebase/nuxt-auth",
  ],

  css: ["~/assets/css/tailwind.css"],

  fonts: {
    defaults: {
      weights: [400, 600, 700],
      styles: ["normal", "italic"],
      subsets: [
        "cyrillic-ext",
        "cyrillic",
        "greek-ext",
        "greek",
        "vietnamese",
        "latin-ext",
        "latin",
      ],
    },
  },

  auth: {
    provider: {
      type: "authjs",
      trustHost: false,
      defaultProvider: "discord",
      addDefaultCallbackUrl: true,
    },
  },

  future: {
    compatibilityVersion: 4,
  },

  runtimeConfig: {
    authSecret: "",
    discordClientId: "",
    discordClientSecret: "",
  },

  compatibilityDate: "2024-11-27",
});
