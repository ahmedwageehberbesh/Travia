import { getGeneratedPlan } from "./gemini-search.js";
import { getDemoPlan } from "../data/demo-search.js";
import { enrichDemoPlan, loadLastSearch } from "../data/demo-plan-details.js";
import { renderPlanDetailPage } from "./plan-detail-render.js";
import { enrichDemoPlanWithGemini } from "./gemini-trip-content.js";
import { hasGeminiApiKey } from "./gemini-config.js";
import { loadLocale, t, getLocale } from "../shared/i18n/index.js";

function showNotFound(root) {
  root.innerHTML = `
    <div class="card empty-state">
      <p>${t("demo.plan_not_found")}</p>
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

async function boot() {
  loadLocale(getLocale());
  document.getElementById("demo-badge").textContent = t("demo.badge");
  document.title = `${t("plan.details")} — Travia`;

  const id = new URLSearchParams(location.search).get("id");
  const root = document.getElementById("plan-root");
  if (!id) {
    showNotFound(root);
    return;
  }

  const basePlan = getGeneratedPlan(id) || getDemoPlan(id, getLocale());
  if (!basePlan) {
    showNotFound(root);
    return;
  }

  const criteria = buildCriteria(basePlan, loadLastSearch() || {});

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
    }
  }

  root.innerHTML = renderPlanDetailPage(enrichDemoPlan(basePlan, criteria));
}

boot();
