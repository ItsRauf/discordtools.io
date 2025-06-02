import { getServerSession, getToken } from "#auth";
import type { RESTGetAPICurrentUserGuildsResult } from "discord-api-types/v10";

export default eventHandler(async (event) => {
  const session = await getServerSession(event);
  if (!session) {
    throw createError({
      statusMessage: "Unauthenticated",
      statusCode: 403,
    });
  }

  const token = await getToken({ event });

  const guilds = await $fetch("https://discord.com/api/v10/users/@me/guilds", {
    headers: {
      Authorization: `Bearer ${token?.auth.access_token}`,
    },
  });

  return guilds as RESTGetAPICurrentUserGuildsResult;
});
