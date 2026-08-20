import { loadLocale, t, locale, setLocale } from "../shared/i18n/index.js";
import { getUser, logout } from "./client-auth.js";
import {
  EGYPT_DESTINATIONS,
  destinationBySlug,
  preloadDestinationImages,
} from "../data/destinations.js";
import { demoBudgetSearch } from "../data/demo-search.js";
import { saveLastSearch } from "../data/demo-plan-details.js";
import { thumb } from "../data/demo-images.js";

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

let destinations = [...EGYPT_DESTINATIONS];
let selectedCitySlug = "sharm_el_sheikh";
let heroRotateIndex = 0;
let heroRotateTimer = null;
let userPinnedCity = false;
let heroFrontLayer = "a";

const tripTypeTrigger = document.getElementById("trip-type-trigger");
const tripTypeDropdown = document.getElementById("trip-type-dropdown");
const tripTypeLabel = document.getElementById("trip-type-label");
const cityTrigger = document.getElementById("city-trigger");
const cityDropdown = document.getElementById("city-dropdown");
const cityLabel = document.getElementById("city-label");
const citySlugInput = document.getElementById("city_slug");
const heroCityName = document.getElementById("hero-city-name");
const heroLayerA = document.querySelector(".hero-bg-layer.layer-a");
const heroLayerB = document.querySelector(".hero-bg-layer.layer-b");

function getDest(slug) {
  return destinations.find((d) => d.slug === slug) || destinationBySlug(slug);
}

function localizeCity(dest) {
  if (!dest) return "";
  return locale === "ar" ? dest.name_ar : dest.name_en;
}

function setDropdownOpen(trigger, dropdown, open) {
  trigger.setAttribute("aria-expanded", String(open));
  dropdown.classList.toggle("hidden", !open);
}

function closeAllDropdowns() {
  setDropdownOpen(tripTypeTrigger, tripTypeDropdown, false);
  setDropdownOpen(cityTrigger, cityDropdown, false);
}

function crossfadeHero(imageUrl, fallbackUrl) {
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

function updateCityUi(slug) {
  const dest = getDest(slug);
  if (!dest) return;
  selectedCitySlug = slug;
  citySlugInput.value = slug;
  cityLabel.textContent = localizeCity(dest);
  heroCityName.textContent = localizeCity(dest);
  crossfadeHero(dest.image, dest.imageFallback);

  cityDropdown.querySelectorAll('input[name="city"]').forEach((input) => {
    input.checked = input.value === slug;
  });
}

function selectCity(slug, { userSelected = false } = {}) {
  if (!getDest(slug)) return;
  updateCityUi(slug);
  heroRotateIndex = destinations.findIndex((d) => d.slug === slug);
  if (userSelected) {
    userPinnedCity = true;
    stopHeroRotation();
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

function renderCityDropdown() {
  cityDropdown.innerHTML = destinations
    .map(
      (dest) => `
    <label class="city-option">
      <input type="radio" name="city" value="${dest.slug}" ${dest.slug === selectedCitySlug ? "checked" : ""} />
      <img class="city-option-thumb" src="${thumb(dest.image, 160)}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.src='${dest.imageFallback}'" />
      <span class="city-option-text">${localizeCity(dest)}</span>
    </label>`
    )
    .join("");
}

function loadDestinations() {
  destinations = [...EGYPT_DESTINATIONS];
  preloadDestinationImages(destinations);
  renderCityDropdown();
  if (!getDest(selectedCitySlug)) {
    selectedCitySlug = destinations[0].slug;
  }
  updateCityUi(selectedCitySlug);
  startHeroRotation();
}

function initCityDropdown() {
  cityTrigger.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = cityTrigger.getAttribute("aria-expanded") === "true";
    setDropdownOpen(tripTypeTrigger, tripTypeDropdown, false);
    setDropdownOpen(cityTrigger, cityDropdown, !isOpen);
  });

  cityDropdown.addEventListener("change", (e) => {
    if (e.target.name === "city") selectCity(e.target.value, { userSelected: true });
  });

  cityDropdown.addEventListener("click", (e) => e.stopPropagation());
}

function getSelectedTripTypes() {
  return [...document.querySelectorAll('input[name="trip_type"]:checked')].map((el) => el.value);
}

function tripTypeName(value) {
  const opt = TRIP_TYPE_OPTIONS.find((o) => o.value === value);
  return opt ? t(opt.i18n) : value;
}

function updateTripTypeLabel() {
  const selected = getSelectedTripTypes();
  if (!selected.length) {
    tripTypeLabel.textContent = t("search.trip_type_placeholder");
    tripTypeTrigger.classList.add("placeholder");
    return;
  }
  tripTypeTrigger.classList.remove("placeholder");
  tripTypeLabel.textContent = selected.map(tripTypeName).join(" · ");
}

function initTripTypeDropdown() {
  tripTypeTrigger.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = tripTypeTrigger.getAttribute("aria-expanded") === "true";
    setDropdownOpen(cityTrigger, cityDropdown, false);
    setDropdownOpen(tripTypeTrigger, tripTypeDropdown, !isOpen);
  });

  tripTypeDropdown.addEventListener("change", (e) => {
    if (e.target.name === "trip_type") updateTripTypeLabel();
  });

  tripTypeDropdown.addEventListener("click", (e) => e.stopPropagation());
}

function applyI18n() {
  document.documentElement.lang = locale;
  document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";

  document.getElementById("app-name").textContent = t("app.name");
  document.getElementById("hero-subtitle").textContent = t("search.subtitle");
  document.getElementById("search-title").textContent = t("search.title");
  document.getElementById("lbl-city").textContent = t("search.city");
  document.getElementById("lbl-budget").textContent = t("search.budget");
  document.getElementById("lbl-people").textContent = t("search.people");
  document.getElementById("lbl-duration").textContent = t("search.duration");
  document.getElementById("lbl-types").textContent = t("search.trip_types");
  document.getElementById("btn-search").textContent = t("search.submit");
  document.getElementById("lang-toggle").textContent = locale === "ar" ? "EN" : "AR";
  const demoBadge = document.getElementById("demo-badge");
  if (demoBadge) demoBadge.textContent = t("demo.badge");
  const demoHint = document.getElementById("demo-hint");
  if (demoHint) demoHint.textContent = t("demo.hint");

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });

  updateTripTypeLabel();
  renderCityDropdown();
  updateCityUi(selectedCitySlug);

  const user = getUser();
  const link = document.getElementById("auth-link");
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

function renderPlanCards(plans) {
  return plans
    .map(
      (p) => `
    <article class="card plan-card plan-card-clickable">
      <a class="plan-card-link" href="plan.html?id=${encodeURIComponent(p.id)}" aria-label="${t("plan.view_details")}">
        <span class="badge value-badge">${tierLabel(p.tier)}</span>
        <h3>${formatEgp(p.total)}</h3>
        ${renderTripItems(p.items)}
        <div class="breakdown-summary">
          <ul class="breakdown-list">${renderBreakdown(p.breakdown)}</ul>
        </div>
        <span class="btn btn-block plan-detail-btn">${t("plan.view_details")} →</span>
      </a>
    </article>`
    )
    .join("");
}

function renderPlans(data) {
  const section = document.getElementById("results-section");
  section.classList.remove("hidden");

  const cityDest = getDest(selectedCitySlug);
  const cityLine = cityDest
    ? `<p class="results-city">${t("search.results_for")} <strong>${localizeCity(cityDest)}</strong> <span class="demo-tag">${t("demo.badge")}</span></p>`
    : "";

  if (data.status === "no_services") {
    section.innerHTML = `
      ${cityLine}
      <div class="card empty-state"><p>${t("search.no_services")}</p></div>`;
    section.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  if (data.status === "insufficient_budget") {
    section.innerHTML = `
      ${cityLine}
      <div class="card insufficient-card">
        <h2>${t("search.insufficient")}</h2>
        <p class="shortfall">${formatEgp(data.user_budget)} — +${formatEgp(data.shortfall)}</p>
      </div>
      <div class="results-header"><h2>${t("search.closest_plans")}</h2></div>
      <div class="grid-3">${renderPlanCards(data.closest_plans || [])}</div>`;
    section.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  section.innerHTML = `
    ${cityLine}
    <div class="results-header"><h2>${t("search.results_title")}</h2></div>
    <div class="grid-3">${renderPlanCards(data.plans || [])}</div>`;
  section.scrollIntoView({ behavior: "smooth", block: "start" });
}

document.addEventListener("click", closeAllDropdowns);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeAllDropdowns();
});

document.getElementById("lang-toggle").onclick = async () => {
  await setLocale(locale === "ar" ? "en" : "ar");
  applyI18n();
};

document.getElementById("search-form").onsubmit = async (e) => {
  e.preventDefault();
  closeAllDropdowns();

  const err = document.getElementById("search-error");
  err.textContent = "";
  const types = getSelectedTripTypes();
  if (!types.length) {
    err.textContent = t("search.trip_type_required");
    setDropdownOpen(tripTypeTrigger, tripTypeDropdown, true);
    return;
  }

  const btn = document.getElementById("btn-search");
  const btnText = t("search.submit");
  btn.disabled = true;
  btn.textContent = t("search.loading");
  document.getElementById("results-section").classList.add("hidden");

  try {
    const searchCriteria = {
      budget: Number(document.getElementById("budget").value),
      city_slug: selectedCitySlug,
      people_count: Number(document.getElementById("people").value),
      duration_days: Number(document.getElementById("duration").value),
      trip_types: types,
      lang: locale,
    };
    saveLastSearch(searchCriteria);

    const data = await demoBudgetSearch(searchCriteria);
    renderPlans(data);
  } catch (ex) {
    err.textContent = ex.message;
  } finally {
    btn.disabled = false;
    btn.textContent = btnText;
  }
};

initTripTypeDropdown();
initCityDropdown();
await loadLocale(locale);
applyI18n();
loadDestinations();
