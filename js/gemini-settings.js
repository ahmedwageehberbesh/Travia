import {
  clearGeminiCache,
  getGeminiApiKey,
  hasGeminiApiKey,
  hasAnyGeminiKeyAttempt,
  isLikelyGoogleGeminiKey,
  setGeminiApiKey,
} from "./gemini-config.js";

export function initGeminiSettings(t) {
  const btn = document.getElementById("gemini-settings-btn");
  const modal = document.getElementById("gemini-modal");
  const input = document.getElementById("gemini-api-key");
  const status = document.getElementById("gemini-status");
  const err = document.getElementById("gemini-error");
  const saveBtn = document.getElementById("gemini-save");
  const clearBtn = document.getElementById("gemini-clear");
  const closeBtn = document.getElementById("gemini-close");

  if (!btn || !modal) return;

  function refreshStatus() {
    if (!status) return;
    const key = getGeminiApiKey();
    if (hasGeminiApiKey()) {
      status.textContent = t("gemini.connected");
      status.className = "gemini-status gemini-status-ok";
      btn.classList.add("gemini-active");
    } else if (hasAnyGeminiKeyAttempt() && key && !isLikelyGoogleGeminiKey(key)) {
      status.textContent = t("gemini.invalid_key");
      status.className = "gemini-status gemini-status-warn";
      btn.classList.remove("gemini-active");
    } else {
      status.textContent = t("gemini.not_connected");
      status.className = "gemini-status";
      btn.classList.remove("gemini-active");
    }
  }

  function openModal() {
    input.value = getGeminiApiKey();
    err.textContent = "";
    refreshStatus();
    modal.classList.remove("hidden");
    input.focus();
  }

  function closeModal() {
    modal.classList.add("hidden");
  }

  btn.onclick = openModal;
  closeBtn && (closeBtn.onclick = closeModal);
  modal.onclick = (e) => {
    if (e.target === modal) closeModal();
  };

  saveBtn && (saveBtn.onclick = () => {
    err.textContent = "";
    const key = input.value.trim();
    if (!key) {
      err.textContent = t("gemini.key_required");
      return;
    }
    if (!isLikelyGoogleGeminiKey(key)) {
      err.textContent = t("gemini.invalid_key");
      return;
    }
    setGeminiApiKey(key);
    clearGeminiCache();
    refreshStatus();
    closeModal();
  });

  clearBtn && (clearBtn.onclick = () => {
    setGeminiApiKey("");
    clearGeminiCache();
    input.value = "";
    err.textContent = "";
    refreshStatus();
  });

  refreshStatus();
}
