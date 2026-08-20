import { getPlanById } from "../data/demo-search.js";
import { enrichDemoPlan, loadLastSearch } from "../data/demo-plan-details.js";
import { renderPlanDetailPage } from "./plan-detail-render.js";
import { enrichDemoPlanWithGemini } from "./gemini-trip-content.js";
import { hasGeminiApiKey, hasAnyGeminiKeyAttempt } from "./gemini-config.js";
import { loadLocale, t, getLocale } from "../shared/i18n/index.js";

function showNotFound(root, hint = "") {
  root.innerHTML = `
    <div class="card empty-state">
      <p>${t("demo.plan_not_found")}</p>
      ${hint ? `<p class="demo-hint">${hint}</p>` : ""}
      <a class="back-link" href="index.html">← ${t("plan.back")}</a>
    </div>`;
}

function buildCriteria(basePlan, saved) {
  return {
    city_slug: saved.city_slug || basePlan.citySlug,
    city_name: saved.city_name || basePlan.cityName,
    trip_types: saved.trip_types || ["SEA"],
    lang: getLocale(),
    people_count: saved.people_count || 2,
    duration_days: saved.duration_days || 5,
    budget: saved.budget,
    custom_notes: saved.custom_notes || "",
  };
}

function renderEnriched(basePlan, criteria, note = "") {
  const enriched = enrichDemoPlan(basePlan, criteria);
  let html = renderPlanDetailPage(enriched);
  if (note) {
    html = `<p class="demo-hint results-fallback">${note}</p>${html}`;
  }
  return html;
}

async function boot() {
  loadLocale(getLocale());
  document.getElementById("demo-badge").textContent = t("demo.badge");
  document.title = `${t("plan.details")} — Travia`;

  const id = new URLSearchParams(location.search).get("id");
  const root = document.getElementById("plan-root");

  if (!id) {
    showNotFound(root, t("plan.search_first_hint"));
    return;
  }

  const basePlan = getPlanById(id, getLocale());
  if (!basePlan) {
    showNotFound(root, t("plan.search_first_hint"));
    return;
  }

  const criteria = buildCriteria(basePlan, loadLastSearch() || {});

  if (hasAnyGeminiKeyAttempt() && !hasGeminiApiKey()) {
    root.innerHTML = renderEnriched(basePlan, criteria, t("gemini.invalid_key"));
    return;
  }

  if (hasGeminiApiKey()) {
    root.innerHTML = `
      <div class="card ai-loading">
        <div class="ai-loading-spinner" aria-hidden="true"></div>
        <p>${t("gemini.generating")}</p>
      </div>`;
    try {
      const enriched = await enrichDemoPlanWithGemini(basePlan, criteria);
      root.innerHTML = renderPlanDetailPage(enriched);
      return;
    } catch (err) {
      console.warn("Gemini detail enrichment failed:", err);
      root.innerHTML = renderEnriched(
        basePlan,
        criteria,
        `${t("gemini.failed")} (${err.message})`
      );
      return;
    }
  }

  root.innerHTML = renderEnriched(basePlan, criteria);
}

boot();
