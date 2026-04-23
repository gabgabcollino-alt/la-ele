// Public/static assets. Logo is bundled in /public so it works in any deployment.
export const LOGO_URL = "/tbx-logo.png";

// Discord invite — defaults to public invite but can be overridden via env.
export const DISCORD_URL =
  process.env.REACT_APP_DISCORD_URL || "https://discord.gg/QdgCXuGJNK";
