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

function showBootError(root, err) {
  root.innerHTML = `
    <div class="card empty-state">
      <p>${t("demo.boot_error")}</p>
      <p class="demo-hint">${err?.message || err}</p>
      <a class="back-link" href="index.html">← ${t("plan.back")}</a>
    </div>`;
}

async function boot() {
  const root = document.getElementById("plan-root");
  if (!root) return;

  try {
    loadLocale(getLocale());
    document.getElementById("demo-badge").textContent = t("demo.badge");
    document.title = `${t("plan.details")} — Travia`;

    const params = new URLSearchParams(location.search);
    const saved = loadLastSearch() || {};
    const id = params.get("id") || defaultSamplePlanId(saved);

    const basePlan = getPlanById(id, getLocale());
    if (!basePlan) {
      throw new Error(t("demo.plan_not_found"));
    }

    const criteria = buildCriteria(basePlan, saved);
    const notes = [];
    if (basePlan.isSamplePlan) notes.push(t("plan.sample_hardcoded"));
    if (hasAnyGeminiKeyAttempt() && !hasGeminiApiKey()) notes.push(t("gemini.invalid_key"));

    // عرض فوري — مش نستنى Gemini
    root.innerHTML = renderEnriched(basePlan, criteria, notes.filter(Boolean).join(" · "));

    if (!hasGeminiApiKey()) return;

    try {
      const enriched = await enrichDemoPlanWithGemini(basePlan, criteria);
      let html = renderPlanDetailPage(enriched);
      if (notes.length) {
        html = `<p class="demo-hint results-fallback">${notes.join(" · ")}</p>${html}`;
      }
      root.innerHTML = html;
    } catch (err) {
      console.warn("Gemini detail enrichment failed:", err);
    }
  } catch (err) {
    console.error("Plan page boot error:", err);
    showBootError(root, err);
  }
}

boot();
