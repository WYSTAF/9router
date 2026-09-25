export default {
  id: "kira",
  priority: 120,
  alias: "kira",
  aliases: [
    "kiraai",
  ],
  uiAlias: "kira",
  display: {
    name: "Kira AI",
    icon: "bolt",
    color: "#B91C1C",
    textIcon: "KR",
    website: "https://kiraai.vn",
    notice: {
      text: "OpenAI-compatible gateway (Vietnam) with a free tier. Wide catalogue spanning chat, image, video and TTS. Base URL is /api/v1, not /v1. The free allowance is account-level, not per-model: the public list marks every model is_free:false.",
      apiKeyUrl: "https://kiraai.vn",
    },
  },
  category: "freeTier",
  authType: "apikey",
  transport: {
    baseUrl: "https://kiraai.vn/api/v1/chat/completions",
    validateUrl: "https://kiraai.vn/api/v1/models",
  },
  // Curated seed. The public catalogue carries 67 entries across chat/image/
  // video/audio; only the chat models are listed here — the others need their
  // own *Config blocks before they can be routed.
  models: [
    { id: "kira-3.5-pro", name: "Kira 3.5 Pro" },
    { id: "kira-3.5-flash", name: "Kira 3.5 Flash" },
    { id: "kira-2.5-pro", name: "Kira 2.5 Pro" },
    { id: "kira-2.5-flash", name: "Kira 2.5 Flash" },
    { id: "kira-flash", name: "Kira Flash" },
    { id: "kira-mini-1.0", name: "Kira Mini 1.0" },
  ],
  modelsFetcher: { url: "https://kiraai.vn/api/v1/models", type: "openai" },
  passthroughModels: true,
};
