import { loadLocale, t, setLocale, getLocale } from "../shared/i18n/index.js";
import { getUser, logout } from "./client-auth.js";
import {
  EGYPT_DESTINATIONS,
  destinationBySlug,
  preloadDestinationImages,
} from "../data/destinations.js";
import { demoBudgetSearch } from "../data/demo-search.js";
import { saveLastSearch } from "../data/demo-plan-details.js";
import { thumb, tripTypeImage } from "../data/demo-images.js";
import { applyGovernorateTheme } from "../data/city-themes.js";

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

let destinations = [...EGYPT_DESTINATIONS];
let selectedCitySlug = "south_sinai";
let selectedTripTypes = new Set(DEFAULT_TRIP_TYPES);
let heroRotateIndex = 0;
let heroRotateTimer = null;
let userPinnedCity = false;
let heroFrontLayer = "a";

let cityPickerEl;
let cityGrid;
let cityTriggerLabel;
let cityTriggerThumb;
let citySlugInput;
let heroCityName;
let heroLayerA;
let heroLayerB;
let tripTypePickerEl;
let tripTypeGrid;
let tripTypeTriggerLabel;

function cacheDom() {
  cityPickerEl = document.getElementById("city-picker");
  cityGrid = document.getElementById("city-grid");
  cityTriggerLabel = document.getElementById("city-trigger-label");
  cityTriggerThumb = document.getElementById("city-trigger-thumb");
  citySlugInput = document.getElementById("city_slug");
  heroCityName = document.getElementById("hero-city-name");
  heroLayerA = document.querySelector(".hero-bg-layer.layer-a");
  heroLayerB = document.querySelector(".hero-bg-layer.layer-b");
  tripTypePickerEl = document.getElementById("trip-type-picker");
  tripTypeGrid = document.getElementById("trip-type-grid");
  tripTypeTriggerLabel = document.getElementById("trip-type-trigger-label");
}

function getDest(slug) {
  return destinations.find((d) => d.slug === slug) || destinationBySlug(slug);
}

function localizeCity(dest) {
  if (!dest) return "";
  return getLocale() === "ar" ? dest.name_ar : dest.name_en;
}

function tripTypeName(value) {
  const opt = TRIP_TYPE_OPTIONS.find((o) => o.value === value);
  return opt ? t(opt.i18n) : value;
}

function closePicker(el) {
  if (el && el.tagName === "DETAILS") el.open = false;
}

function closeAllPickers() {
  closePicker(cityPickerEl);
  closePicker(tripTypePickerEl);
}

function crossfadeHero(imageUrl, fallbackUrl) {
  if (!heroLayerA || !heroLayerB) return;
  const nextLayer = heroFrontLayer === "a" ? heroLayerB : heroLayerA;
  const currentLayer = heroFrontLayer === "a" ? heroLayerA : heroLayerB;

  const apply = (url) => {
    nextLayer.style.backgroundImage = `url("${url}")`;
    nextLayer.classList.add("is-visible");
    currentLayer.classList.remove("is-visible");
    heroFrontLayer = heroFrontLayer === "a" ? "b" : "a";
  };

  const probe = new Image();
  probe.onload = () => apply(imageUrl);
  probe.onerror = () => apply(fallbackUrl || imageUrl);
  probe.src = imageUrl;
}

function imgFallback(el, url) {
  if (!el || !url) return;
  el.addEventListener("error", () => {
    if (el.dataset.fallback && el.src !== el.dataset.fallback) {
      el.src = el.dataset.fallback;
    }
  }, { once: true });
  el.src = url;
}

function updateCityUi(slug) {
  const dest = getDest(slug);
  if (!dest) return;
  selectedCitySlug = slug;
  applyGovernorateTheme(slug);
  if (citySlugInput) citySlugInput.value = slug;
  if (cityTriggerLabel) cityTriggerLabel.textContent = localizeCity(dest);
  if (cityTriggerThumb) {
    cityTriggerThumb.dataset.fallback = dest.imageFallback || dest.image;
    cityTriggerThumb.alt = localizeCity(dest);
    imgFallback(cityTriggerThumb, thumb(dest.image, 80));
  }
  if (heroCityName) heroCityName.textContent = localizeCity(dest);
  crossfadeHero(dest.image, dest.imageFallback);

  cityGrid?.querySelectorAll(".picker-card").forEach((card) => {
    card.classList.toggle("is-selected", card.dataset.value === slug);
  });
}

function selectCity(slug, { userSelected = false } = {}) {
  if (!getDest(slug)) return;
  updateCityUi(slug);
  heroRotateIndex = destinations.findIndex((d) => d.slug === slug);
  if (userSelected) {
    userPinnedCity = true;
    stopHeroRotation();
    closePicker(cityPickerEl);
  }
}

function updateTripTypeUi() {
  const labels = [...selectedTripTypes].map(tripTypeName);
  if (tripTypeTriggerLabel) {
    tripTypeTriggerLabel.textContent = labels.length
      ? labels.join(" · ")
      : t("search.trip_type_placeholder");
  }
  tripTypeGrid?.querySelectorAll(".picker-card").forEach((card) => {
    card.classList.toggle("is-selected", selectedTripTypes.has(card.dataset.value));
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

function renderCityGrid() {
  if (!cityGrid) return;
  cityGrid.innerHTML = destinations
    .map((dest) => {
      const img = thumb(dest.imageFallback || dest.image, 200);
      const fb = dest.imageFallback || dest.image;
      const selected = dest.slug === selectedCitySlug ? " is-selected" : "";
      return `<button type="button" class="picker-card${selected}" data-value="${dest.slug}">
      <img class="picker-card-img" src="${img}" data-fallback="${fb}" alt="${localizeCity(dest)}" loading="lazy" referrerpolicy="no-referrer" />
      <span class="picker-card-label">${localizeCity(dest)}</span>
    </button>`;
    })
    .join("");
  cityGrid.querySelectorAll(".picker-card-img").forEach((img) => {
    img.addEventListener("error", () => {
      if (img.dataset.fallback) img.src = img.dataset.fallback;
    }, { once: true });
  });
}

function renderTripTypeGrid() {
  if (!tripTypeGrid) return;
  tripTypeGrid.innerHTML = TRIP_TYPE_OPTIONS.map(
    (opt) => `
    <button type="button" class="picker-card picker-card-trip ${selectedTripTypes.has(opt.value) ? "is-selected" : ""}"
      data-value="${opt.value}">
      <img class="picker-card-img" src="${tripTypeImage(opt.value)}" alt="" loading="lazy" referrerpolicy="no-referrer" />
      <span class="picker-card-label">${t(opt.i18n)}</span>
      <span class="picker-check" aria-hidden="true">✓</span>
    </button>`
  ).join("");
}

function initCityPicker() {
  if (!cityGrid) return;

  cityGrid.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const card = e.target.closest(".picker-card");
    if (!card) return;
    selectCity(card.dataset.value, { userSelected: true });
  });

  if (cityPickerEl) {
    cityPickerEl.addEventListener("toggle", () => {
      if (cityPickerEl.open) closePicker(tripTypePickerEl);
    });
  }
}

function initTripTypePicker() {
  if (!tripTypeGrid) return;

  tripTypeGrid.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const card = e.target.closest(".picker-card");
    if (!card) return;
    toggleTripType(card.dataset.value);
  });

  if (tripTypePickerEl) {
    tripTypePickerEl.addEventListener("toggle", () => {
      if (tripTypePickerEl.open) closePicker(cityPickerEl);
    });
  }
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
  preloadDestinationImages(destinations);
  renderCityGrid();
  renderTripTypeGrid();
  if (!getDest(selectedCitySlug)) selectedCitySlug = destinations[0].slug;
  updateCityUi(selectedCitySlug);
  updateTripTypeUi();
  startHeroRotation();
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
  setText("btn-search", "search.submit");

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
  updateCityUi(selectedCitySlug);
  updateTripTypeUi();

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
  const map = { economy: "plan.economy", balanced: "plan.balanced", comfort: "plan.comfort" };
  return t(map[tier] || tier);
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

function renderPlanCards(plans, { aiGenerated = false, userBudget } = {}) {
  return plans
    .map((p) => {
      const budgetBadge = p.within_budget
        ? `<span class="budget-badge budget-ok">${t("search.within_budget")}</span>`
        : `<span class="budget-badge budget-over">${t("search.over_budget")}</span>`;

      return `
    <article class="card plan-card plan-card-clickable">
      <a class="plan-card-link" href="plan.html?id=${encodeURIComponent(p.id)}" aria-label="${t("plan.view_details")}">
        <div class="plan-card-hero">
          <img class="plan-card-city-img" src="${p.cityImage || ""}" alt="${p.cityName || ""}"
            loading="lazy" referrerpolicy="no-referrer"
            onerror="this.src='${p.cityImageFallback || ""}'" />
          <div class="plan-card-hero-overlay">
            <span class="badge value-badge">${tierLabel(p.tier)}</span>
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

function renderPlans(data) {
  const section = document.getElementById("results-section");
  if (!section) return;
  section.classList.remove("hidden");
  closeAllPickers();

  const cityDest = getDest(selectedCitySlug);
  const cityLine = cityDest
    ? `<p class="results-city">${t("search.results_for")} <strong>${localizeCity(cityDest)}</strong> · ${t("search.budget_label")}: <strong>${formatEgp(data.user_budget)}</strong> <span class="demo-tag">${t("demo.badge")}</span></p>`
    : "";

  const aiTag = data.aiGenerated ? `<span class="gemini-tag">${t("gemini.badge")}</span>` : "";
  const cardOpts = { aiGenerated: data.aiGenerated, userBudget: data.user_budget };

  if (data.status === "insufficient_budget") {
    section.innerHTML = `
      ${cityLine}
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
      <div class="results-header"><h2>${t("search.results_title")} ${aiTag}</h2></div>
      <div class="grid-3">${renderPlanCards(data.plans || [], cardOpts)}</div>`;
  }
  section.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function maybeEnhanceWithGemini(data, criteria) {
  try {
    const { hasGeminiApiKey } = await import("./gemini-config.js");
    if (!hasGeminiApiKey()) return data;
    const { enhanceSearchResultsWithGemini } = await import("./gemini-trip-content.js");
    return await enhanceSearchResultsWithGemini(data, criteria);
  } catch {
    return data;
  }
}

async function boot() {
  try {
    cacheDom();
    initCityPicker();
    initTripTypePicker();
    loadDestinations();

    loadLocale(getLocale());
    applyI18n();
    const { initGeminiSettings } = await import("./gemini-settings.js");
    initGeminiSettings(t);
  } catch (err) {
    console.error("Travia boot error:", err);
    const errEl = document.getElementById("search-error");
    if (errEl) {
      errEl.textContent = "التطبيق لم يحمّل كامل. شغّل: npm start (مش file://)";
    }
    return;
  }

  document.getElementById("lang-toggle")?.addEventListener("click", () => {
    setLocale(getLocale() === "ar" ? "en" : "ar");
    applyI18n();
  });

  document.getElementById("search-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    closeAllPickers();

    const err = document.getElementById("search-error");
    if (err) err.textContent = "";
    const types = getSelectedTripTypes();
    if (!types.length) {
      if (err) err.textContent = t("search.trip_type_required");
      if (tripTypePickerEl) tripTypePickerEl.open = true;
      return;
    }

    const btn = document.getElementById("btn-search");
    const btnText = t("search.submit");
    if (btn) {
      btn.disabled = true;
      btn.textContent = t("search.loading");
    }
    document.getElementById("results-section")?.classList.add("hidden");

    try {
      const searchCriteria = {
        budget: Number(document.getElementById("budget")?.value),
        city_slug: selectedCitySlug,
        people_count: Number(document.getElementById("people")?.value),
        duration_days: Number(document.getElementById("duration")?.value),
        trip_types: types,
        lang: getLocale(),
      };
      saveLastSearch(searchCriteria);

      let data = await demoBudgetSearch(searchCriteria);
      data = await maybeEnhanceWithGemini(data, searchCriteria);
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
