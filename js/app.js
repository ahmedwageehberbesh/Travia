import { loadLocale, t, setLocale, getLocale } from "../shared/i18n/index.js";
import { getUser, logout } from "./client-auth.js";
import {
  EGYPT_DESTINATIONS,
  destinationBySlug,
  destinationGradient,
  normalizeSlug,
} from "../data/destinations.js";
import { applyGovernorateTheme } from "../data/city-themes.js";
import {
  PLAN_TEMPLATES,
  DEFAULT_TEMPLATE_IDS,
} from "../data/plan-templates.js";
import { geminiBudgetSearch } from "./gemini-search.js";
import { demoBudgetSearch } from "../data/demo-search.js";
import { saveLastSearch, saveGeneratedPlans } from "../data/demo-plan-details.js";
import { hasGeminiApiKey } from "./gemini-config.js";

const TRIP_TYPE_OPTIONS = [
  { value: "SEA", i18n: "search.trip_sea" },
  { value: "RELAXATION", i18n: "search.trip_relaxation" },
  { value: "ADVENTURE", i18n: "search.trip_adventure" },
  { value: "HERITAGE", i18n: "search.trip_heritage" },
  { value: "HONEYMOON", i18n: "search.trip_honeymoon" },
];

const SERVICE_TYPE_ORDER = ["HOTEL", "PACKAGE", "TRANSPORT", "ACTIVITY"];
const SERVICE_TYPE_I18N = {
  HOTEL: "plan.accommodation",
  PACKAGE: "plan.package",
  TRANSPORT: "plan.transport",
  ACTIVITY: "plan.activities",
};

const HERO_ROTATE_MS = 6000;
const DEFAULT_TRIP_TYPES = new Set(["SEA", "RELAXATION"]);

const DEFAULT_TEMPLATES = new Set(DEFAULT_TEMPLATE_IDS);

let destinations = [...EGYPT_DESTINATIONS];
let selectedCitySlug = "south_sinai";
let selectedTripTypes = new Set(DEFAULT_TRIP_TYPES);
let selectedTemplates = new Set(DEFAULT_TEMPLATES);
let cityFilter = "";
let heroRotateIndex = 0;
let heroRotateTimer = null;
let userPinnedCity = false;

let cityGrid;
let citySearchInput;
let selectedCityLabel;
let selectedCityDot;
let citySlugInput;
let heroCityName;
let heroLayerA;
let heroLayerB;
let tripTypeGrid;
let templateGrid;
let customNotesInput;

function cacheDom() {
  cityGrid = document.getElementById("city-grid");
  citySearchInput = document.getElementById("city-search");
  selectedCityLabel = document.getElementById("selected-city-label");
  selectedCityDot = document.getElementById("selected-city-dot");
  citySlugInput = document.getElementById("city_slug");
  heroCityName = document.getElementById("hero-city-name");
  heroLayerA = document.querySelector(".hero-bg-layer.layer-a");
  heroLayerB = document.querySelector(".hero-bg-layer.layer-b");
  tripTypeGrid = document.getElementById("trip-type-grid");
  templateGrid = document.getElementById("template-grid");
  customNotesInput = document.getElementById("custom-notes");
}

function getDest(slug) {
  return destinations.find((d) => d.slug === slug) || destinationBySlug(slug);
}

function localizeCity(dest) {
  if (!dest) return "";
  return getLocale() === "ar" ? dest.name_ar : dest.name_en;
}

function updateHeroColor(slug) {
  const gradient = destinationGradient(slug);
  if (heroLayerA) {
    heroLayerA.style.background = gradient;
    heroLayerA.classList.add("is-visible");
  }
  if (heroLayerB) heroLayerB.style.background = gradient;
}

function filteredDestinations() {
  const q = cityFilter.trim().toLowerCase();
  if (!q) return destinations;
  return destinations.filter((d) => {
    const ar = d.name_ar.toLowerCase();
    const en = d.name_en.toLowerCase();
    return ar.includes(q) || en.includes(q) || d.slug.includes(q);
  });
}

function updateCityUi(slug) {
  const dest = getDest(slug);
  if (!dest) return;
  selectedCitySlug = slug;
  applyGovernorateTheme(slug);
  if (citySlugInput) citySlugInput.value = slug;
  const name = localizeCity(dest);
  if (heroCityName) heroCityName.textContent = name;
  if (selectedCityLabel) selectedCityLabel.textContent = name;
  if (selectedCityDot) {
    selectedCityDot.style.background = dest.color.bg;
    selectedCityDot.style.borderColor = dest.color.accent;
  }
  updateHeroColor(slug);
  renderCityGrid();
}

function selectCity(slug) {
  if (!getDest(slug)) return;
  updateCityUi(slug);
  heroRotateIndex = destinations.findIndex((d) => d.slug === slug);
  userPinnedCity = true;
  stopHeroRotation();
}

function updateTripTypeUi() {
  tripTypeGrid?.querySelectorAll(".picker-chip").forEach((chip) => {
    chip.classList.toggle("is-selected", selectedTripTypes.has(chip.dataset.value));
  });
}

function toggleTripType(value) {
  if (selectedTripTypes.has(value)) {
    if (selectedTripTypes.size > 1) selectedTripTypes.delete(value);
  } else {
    selectedTripTypes.add(value);
  }
  updateTripTypeUi();
}

function getSelectedTripTypes() {
  return [...selectedTripTypes];
}

function toggleTemplate(id) {
  if (selectedTemplates.has(id)) {
    if (selectedTemplates.size > 1) selectedTemplates.delete(id);
  } else {
    selectedTemplates.add(id);
  }
  updateTemplateUi();
}

function getSelectedTemplates() {
  return [...selectedTemplates];
}

function updateTemplateUi() {
  templateGrid?.querySelectorAll(".template-chip").forEach((chip) => {
    chip.classList.toggle("is-selected", selectedTemplates.has(chip.dataset.value));
  });
}

function renderCityGrid() {
  if (!cityGrid) return;
  const list = filteredDestinations();
  cityGrid.innerHTML = list.length
    ? list
        .map(
          (dest) => `
    <button type="button" class="city-chip ${dest.slug === selectedCitySlug ? "is-selected" : ""}"
      data-value="${dest.slug}" title="${dest.color.label}">
      <span class="city-chip-dot" style="background:${dest.color.bg};border-color:${dest.color.accent}"></span>
      <span class="city-chip-label">${localizeCity(dest)}</span>
    </button>`
        )
        .join("")
    : `<p class="picker-empty">${t("search.no_city_match")}</p>`;
}

function renderTripTypeGrid() {
  if (!tripTypeGrid) return;
  tripTypeGrid.innerHTML = TRIP_TYPE_OPTIONS.map(
    (opt) => `
    <button type="button" class="picker-chip ${selectedTripTypes.has(opt.value) ? "is-selected" : ""}"
      data-value="${opt.value}">
      <span class="picker-chip-label">${t(opt.i18n)}</span>
      <span class="picker-check" aria-hidden="true">✓</span>
    </button>`
  ).join("");
}

function renderTemplateGrid() {
  if (!templateGrid) return;
  templateGrid.innerHTML = PLAN_TEMPLATES.map(
    (tpl) => `
    <button type="button" class="picker-chip template-chip ${selectedTemplates.has(tpl.id) ? "is-selected" : ""}"
      data-value="${tpl.id}" title="${getLocale() === "ar" ? tpl.hint_ar : tpl.hint_en}">
      <span class="picker-chip-label">${t(tpl.i18n)}</span>
      <span class="picker-check" aria-hidden="true">✓</span>
    </button>`
  ).join("");
}

function initCityPicker() {
  cityGrid?.addEventListener("click", (e) => {
    const chip = e.target.closest(".city-chip");
    if (!chip) return;
    selectCity(chip.dataset.value);
  });
  citySearchInput?.addEventListener("input", () => {
    cityFilter = citySearchInput.value;
    renderCityGrid();
  });
}

function initTemplatePicker() {
  templateGrid?.addEventListener("click", (e) => {
    const chip = e.target.closest(".template-chip");
    if (!chip) return;
    toggleTemplate(chip.dataset.value);
  });
}

function initTripTypePicker() {
  tripTypeGrid?.addEventListener("click", (e) => {
    const chip = e.target.closest(".picker-chip");
    if (!chip) return;
    toggleTripType(chip.dataset.value);
  });
}

function startHeroRotation() {
  stopHeroRotation();
  heroRotateTimer = setInterval(() => {
    if (userPinnedCity) return;
    heroRotateIndex = (heroRotateIndex + 1) % destinations.length;
    updateCityUi(destinations[heroRotateIndex].slug);
  }, HERO_ROTATE_MS);
}

function stopHeroRotation() {
  if (heroRotateTimer) {
    clearInterval(heroRotateTimer);
    heroRotateTimer = null;
  }
}

function loadDestinations() {
  destinations = [...EGYPT_DESTINATIONS];
  const fromUrl = new URLSearchParams(location.search).get("city_slug");
  if (fromUrl && getDest(fromUrl)) selectedCitySlug = normalizeSlug(fromUrl);
  renderCityGrid();
  renderTripTypeGrid();
  renderTemplateGrid();
  if (!getDest(selectedCitySlug)) selectedCitySlug = destinations[0].slug;
  updateCityUi(selectedCitySlug);
  updateTripTypeUi();
  updateTemplateUi();
  startHeroRotation();
}

function applyPlaceholders() {
  const ph = (id, key) => {
    const el = document.getElementById(id);
    if (el) el.placeholder = t(key);
  };
  ph("city-search", "search.city_search");
  ph("custom-notes", "search.custom_notes_placeholder");
}

function applyI18n() {
  document.documentElement.lang = getLocale();
  document.documentElement.dir = getLocale() === "ar" ? "rtl" : "ltr";

  const setText = (id, key) => {
    const el = document.getElementById(id);
    if (el) el.textContent = t(key);
  };

  setText("app-name", "app.name");
  setText("hero-subtitle", "search.subtitle");
  setText("search-title", "search.title");
  setText("lbl-budget", "search.budget");
  setText("lbl-people", "search.people");
  setText("lbl-duration", "search.duration");
  setText("lbl-city", "search.city");
  setText("lbl-trip-types", "search.trip_types");
  setText("lbl-custom-notes", "search.custom_notes");
  setText("lbl-templates", "search.templates");
  setText("btn-search", "search.submit");
  applyPlaceholders();

  const langToggle = document.getElementById("lang-toggle");
  if (langToggle) langToggle.textContent = getLocale() === "ar" ? "EN" : "AR";

  const demoBadge = document.getElementById("demo-badge");
  if (demoBadge) demoBadge.textContent = t("demo.badge");
  const demoHint = document.getElementById("demo-hint");
  if (demoHint) demoHint.textContent = t("demo.hint");

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });

  renderCityGrid();
  renderTripTypeGrid();
  renderTemplateGrid();
  updateCityUi(selectedCitySlug);
  updateTripTypeUi();
  updateTemplateUi();

  const user = getUser();
  const link = document.getElementById("auth-link");
  if (!link) return;
  if (user) {
    link.textContent = `${user.full_name} — ${t("auth.logout")}`;
    link.href = "#";
    link.onclick = async (e) => {
      e.preventDefault();
      await logout();
      location.reload();
    };
  } else {
    link.textContent = t("auth.login");
    link.href = "login.html";
    link.onclick = null;
  }
}

function tierLabel(tier) {
  const map = {
    economy: "plan.economy",
    balanced: "plan.balanced",
    comfort: "plan.comfort",
    family: "template.family",
    adventure: "template.adventure",
  };
  return t(map[tier] || tier);
}

function planBadgeLabel(p) {
  return p.templateName || tierLabel(p.tier);
}

function formatEgp(value) {
  return `${Number(value).toLocaleString()} EGP`;
}

function renderBreakdown(breakdown) {
  const rows = [
    ["plan.accommodation", breakdown.accommodation],
    ["plan.transport", breakdown.transport],
    ["plan.activities", breakdown.activities],
    ["plan.service_fee", breakdown.service_fee],
  ];
  return rows
    .map(
      ([key, val]) =>
        `<li><span>${t(key)}</span><span>${Number(val).toLocaleString()}</span></li>`
    )
    .join("");
}

function renderTripItems(items) {
  if (!items?.length) {
    return `<p class="empty-state" style="padding:0">${t("search.no_trip_items")}</p>`;
  }

  const grouped = {};
  for (const item of items) {
    if (!grouped[item.type]) grouped[item.type] = [];
    grouped[item.type].push(item);
  }

  const sections = SERVICE_TYPE_ORDER.filter((type) => grouped[type]?.length).map(
    (type) => `
      <div class="trip-section">
        <h4>${t(SERVICE_TYPE_I18N[type] || type)}</h4>
        <ul class="trip-items-list">
          ${grouped[type]
            .map(
              (item) =>
                `<li><span>${item.name}</span><span>${formatEgp(item.cost)}</span></li>`
            )
            .join("")}
        </ul>
      </div>`
  );

  return `
    <div class="trip-full">
      <p class="trip-full-title">${t("plan.full_trip")}</p>
      ${sections.join("")}
    </div>`;
}

function planHeroColor(slug) {
  const dest = getDest(slug);
  if (!dest) return "var(--color-primary)";
  return `linear-gradient(135deg, ${dest.color.accent}, ${dest.color.bg})`;
}

function renderPlanCards(plans, { aiGenerated = false, userBudget } = {}) {
  return plans
    .map((p) => {
      const budgetBadge = p.within_budget
        ? `<span class="budget-badge budget-ok">${t("search.within_budget")}</span>`
        : `<span class="budget-badge budget-over">${t("search.over_budget")}</span>`;
      const heroStyle = planHeroColor(p.citySlug);

      return `
    <article class="card plan-card plan-card-clickable">
      <a class="plan-card-link" href="plan.html?id=${encodeURIComponent(p.id)}" aria-label="${t("plan.view_details")}">
        <div class="plan-card-hero plan-card-hero-color" style="background:${heroStyle}">
          <div class="plan-card-hero-overlay">
            <span class="badge value-badge">${planBadgeLabel(p)}</span>
            ${budgetBadge}
          </div>
        </div>
        <div class="plan-card-body">
          <p class="plan-card-city">${p.cityName || ""}</p>
          ${aiGenerated || p.aiSummary ? `<span class="gemini-tag">${t("gemini.badge")}</span>` : ""}
          <h3>${formatEgp(p.total)}</h3>
          ${p.within_budget && p.budget_remaining != null
            ? `<p class="plan-budget-left">${t("search.budget_label")}: ${formatEgp(userBudget)}</p>`
            : ""}
          ${p.aiSummary ? `<p class="plan-ai-summary">${p.aiSummary}</p>` : ""}
          ${renderTripItems(p.items)}
          <div class="breakdown-summary">
            <ul class="breakdown-list">${renderBreakdown(p.breakdown)}</ul>
          </div>
          <span class="btn btn-block plan-detail-btn">${t("plan.view_details")} →</span>
        </div>
      </a>
    </article>`;
    })
    .join("");
}

function storePlans(data) {
  const plans = data.plans || data.closest_plans || [];
  if (plans.length) saveGeneratedPlans(plans);
}

async function runSearch(criteria) {
  if (hasGeminiApiKey()) {
    try {
      return await geminiBudgetSearch(criteria);
    } catch (geminiErr) {
      const data = await demoBudgetSearch(criteria);
      storePlans(data);
      data.fallbackNote =
        criteria.lang === "ar"
          ? `Gemini فشل (${geminiErr.message}) — عرض خطط تجريبية`
          : `Gemini failed (${geminiErr.message}) — showing demo plans`;
      return data;
    }
  }
  const data = await demoBudgetSearch(criteria);
  storePlans(data);
  data.fallbackNote =
    criteria.lang === "ar"
      ? "اربط Gemini من ✨ للتوليد بالذكاء الاصطناعي"
      : "Connect Gemini via ✨ for AI-generated plans";
  return data;
}

function renderPlans(data) {
  const section = document.getElementById("results-section");
  if (!section) return;
  section.classList.remove("hidden");

  const cityDest = getDest(selectedCitySlug);
  const fallbackLine = data.fallbackNote
    ? `<p class="demo-hint results-fallback">${data.fallbackNote}</p>`
    : "";
  const cityLine = cityDest
    ? `<p class="results-city">${t("search.results_for")} <strong>${localizeCity(cityDest)}</strong> · ${t("search.budget_label")}: <strong>${formatEgp(data.user_budget)}</strong> <span class="demo-tag">${t("demo.badge")}</span></p>`
    : "";

  const aiTag = data.aiGenerated ? `<span class="gemini-tag">${t("gemini.badge")}</span>` : "";
  const cardOpts = { aiGenerated: data.aiGenerated, userBudget: data.user_budget };

  if (data.status === "insufficient_budget") {
    section.innerHTML = `
      ${cityLine}
      ${fallbackLine}
      <div class="card insufficient-card">
        <h2>${t("search.insufficient")}</h2>
        <p class="shortfall">${formatEgp(data.user_budget)} — +${formatEgp(data.shortfall)}</p>
        ${data.suggestions?.[0]?.message ? `<p>${data.suggestions[0].message}</p>` : ""}
      </div>
      <div class="results-header"><h2>${t("search.closest_plans")} ${aiTag}</h2></div>
      <div class="grid-3">${renderPlanCards(data.closest_plans || [], cardOpts)}</div>`;
  } else {
    section.innerHTML = `
      ${cityLine}
      ${fallbackLine}
      <div class="results-header"><h2>${t("search.results_title")} ${aiTag}</h2></div>
      <div class="grid-3">${renderPlanCards(data.plans || [], cardOpts)}</div>`;
  }
  section.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function boot() {
  try {
    cacheDom();
    initCityPicker();
    initTripTypePicker();
    initTemplatePicker();
    loadDestinations();

    loadLocale(getLocale());
    applyI18n();
    const { initGeminiSettings } = await import("./gemini-settings.js");
    initGeminiSettings(t);
  } catch (err) {
    console.error("Travia boot error:", err);
    const errEl = document.getElementById("search-error");
    if (errEl) errEl.textContent = t("demo.boot_error");
    return;
  }

  document.getElementById("lang-toggle")?.addEventListener("click", () => {
    setLocale(getLocale() === "ar" ? "en" : "ar");
    applyI18n();
  });

  document.getElementById("search-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const err = document.getElementById("search-error");
    if (err) err.textContent = "";
    const types = getSelectedTripTypes();
    if (!types.length) {
      if (err) err.textContent = t("search.trip_type_required");
      return;
    }

    const templates = getSelectedTemplates();
    if (!templates.length) {
      if (err) err.textContent = t("search.template_required");
      return;
    }

    const btn = document.getElementById("btn-search");
    const btnText = t("search.submit");
    if (btn) {
      btn.disabled = true;
      btn.textContent = t("search.loading_ai");
    }
    document.getElementById("results-section")?.classList.add("hidden");

    try {
      const searchCriteria = {
        budget: Number(document.getElementById("budget")?.value),
        city_slug: selectedCitySlug,
        people_count: Number(document.getElementById("people")?.value),
        duration_days: Number(document.getElementById("duration")?.value),
        trip_types: types,
        templates,
        custom_notes: customNotesInput?.value?.trim() || "",
        lang: getLocale(),
      };
      saveLastSearch(searchCriteria);

      const data = await runSearch(searchCriteria);
      renderPlans(data);
    } catch (ex) {
      if (err) err.textContent = ex.message;
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = btnText;
      }
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
