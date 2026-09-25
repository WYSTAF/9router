export default {
  id: "bynara",
  priority: 120,
  alias: "bynara",
  aliases: [
    "nara",
  ],
  uiAlias: "bynara",
  display: {
    name: "Bynara Router",
    icon: "alt_route",
    color: "#4F46E5",
    textIcon: "NR",
    website: "https://bynara.id",
    notice: {
      text: "OpenAI-compatible router that picks a backend per request. Accepts keys of the sk-nry- form. Its own docs show model \"auto/bynara\" to let the router choose.",
      apiKeyUrl: "https://bynara.id",
    },
  },
  category: "apikey",
  authType: "apikey",
  transport: {
    baseUrl: "https://router.bynara.id/v1/chat/completions",
    validateUrl: "https://router.bynara.id/v1/models",
  },
  // The catalogue is dynamic and the router exposes an "auto/bynara" id that
  // defers model selection to the provider, so nothing is hardcoded here.
  modelsFetcher: { url: "https://router.bynara.id/v1/models", type: "openai" },
  passthroughModels: true,
};
