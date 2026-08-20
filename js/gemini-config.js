import { ENV } from "./env-config.js";

export const GEMINI_KEY_STORAGE = "travia_gemini_api_key";
export const GEMINI_MODEL = "gemini-2.0-flash";
export const GEMINI_CACHE_PREFIX = "travia_gemini_cache_";

/** Priority: localStorage (UI) → .env via env-config.js */
export function getGeminiApiKey() {
  const fromUi = localStorage.getItem(GEMINI_KEY_STORAGE)?.trim();
  if (fromUi) return fromUi;
  return ENV?.GEMINI_API_KEY?.trim() || "";
}

export function setGeminiApiKey(key) {
  const trimmed = key?.trim() || "";
  if (trimmed) localStorage.setItem(GEMINI_KEY_STORAGE, trimmed);
  else localStorage.removeItem(GEMINI_KEY_STORAGE);
}

export function hasGeminiApiKey() {
  return Boolean(getGeminiApiKey());
}

export function clearGeminiCache() {
  Object.keys(localStorage)
    .filter((k) => k.startsWith(GEMINI_CACHE_PREFIX))
    .forEach((k) => localStorage.removeItem(k));
}
