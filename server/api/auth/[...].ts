import DiscordProvider from "next-auth/providers/discord";
import { NuxtAuthHandler } from "#auth";

export default NuxtAuthHandler({
  // A secret string you define, to ensure correct encryption
  secret: useRuntimeConfig().authSecret,
  providers: [
    // @ts-expect-error You need to use .default here for it to work during SSR. May be fixed via Vite at some point
    DiscordProvider.default({
      clientId: useRuntimeConfig().discordClientId,
      clientSecret: useRuntimeConfig().discordClientSecret,
      authorization: { params: { scope: "identify guilds", prompt: "none" } },
    }),
  ],
  callbacks: {
    jwt({ token, account, profile }) {
      if (account) {
        token.auth = account;
        token.profile = profile;
      }
      return token;
    },
  },
});
