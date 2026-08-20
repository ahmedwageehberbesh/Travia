import { getPlanById, defaultSamplePlanId } from "../data/demo-search.js";
import { enrichDemoPlan, loadLastSearch } from "../data/demo-plan-details.js";
import { renderPlanDetailPage } from "./plan-detail-render.js";
import { enrichDemoPlanWithGemini } from "./gemini-trip-content.js";
import { hasGeminiApiKey, hasAnyGeminiKeyAttempt } from "./gemini-config.js";
import { loadLocale, t, getLocale } from "../shared/i18n/index.js";

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

  const params = new URLSearchParams(location.search);
  const saved = loadLastSearch() || {};
  const id = params.get("id") || defaultSamplePlanId(saved);
  const root = document.getElementById("plan-root");

  const basePlan = getPlanById(id, getLocale());
  const criteria = buildCriteria(basePlan, saved);

  const notes = [];
  if (basePlan.isSamplePlan) notes.push(t("plan.sample_hardcoded"));
  if (hasAnyGeminiKeyAttempt() && !hasGeminiApiKey()) notes.push(t("gemini.invalid_key"));

  if (hasGeminiApiKey()) {
    root.innerHTML = `
      <div class="card ai-loading">
        <div class="ai-loading-spinner" aria-hidden="true"></div>
        <p>${t("gemini.generating")}</p>
      </div>`;
    try {
      const enriched = await enrichDemoPlanWithGemini(basePlan, criteria);
      let html = renderPlanDetailPage(enriched);
      if (notes.length) {
        html = `<p class="demo-hint results-fallback">${notes.join(" · ")}</p>${html}`;
      }
      root.innerHTML = html;
      return;
    } catch (err) {
      console.warn("Gemini detail enrichment failed:", err);
      notes.push(`${t("gemini.failed")} (${err.message})`);
    }
  }

  root.innerHTML = renderEnriched(basePlan, criteria, notes.filter(Boolean).join(" · "));
}

boot();
