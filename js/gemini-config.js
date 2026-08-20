export const GEMINI_KEY_STORAGE = "travia_gemini_api_key";
export const GEMINI_MODEL = "gemini-2.0-flash";
export const GEMINI_CACHE_PREFIX = "travia_gemini_cache_";

export function getGeminiApiKey() {
  return localStorage.getItem(GEMINI_KEY_STORAGE)?.trim() || "";
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
