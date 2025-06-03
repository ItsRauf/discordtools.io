export const useEmbed = (
  tool:
    | {
        name: string;
        description: string;
        image: string;
      }
    | undefined
) => {
  const img = useImage();
  const url = useRequestURL();
  return useSeoMeta({
    title: tool?.name,
    ogSiteName: "discordtools.io",
    ogTitle: tool?.name,
    description: tool?.description,
    ogDescription: tool?.description,
    ogImage: `${url.origin}${img(tool!.image)}`,
    twitterCard: "summary_large_image",
  });
};
