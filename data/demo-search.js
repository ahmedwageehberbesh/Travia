import { destinationBySlug, normalizeSlug } from "./destinations.js";
import { demoDelay } from "./demo-config.js";
import { loadLastSearch } from "./demo-plan-details.js";
import { catalogSummary, catalogPlanItems } from "./demo-catalog.js";
import { thumb } from "./demo-images.js";

const TIER_RATES = {
  economy: { hotel: 650, activity: 280 },
  balanced: { hotel: 1200, activity: 450 },
  comfort: { hotel: 2400, activity: 750 },
};

const CITY_PRICE_FACTOR = {
  south_sinai: 1.18,
  red_sea: 1.08,
  matrouh: 0.95,
  cairo: 0.92,
  giza: 0.92,
  alexandria: 0.9,
  luxor: 0.88,
  aswan: 0.86,
  new_valley: 0.78,
  fayoum: 0.82,
  minya: 0.8,
  qena: 0.79,
  sohag: 0.77,
  north_sinai: 0.74,
  ismailia: 0.76,
  port_said: 0.75,
  suez: 0.74,
  damietta: 0.73,
  dakahlia: 0.72,
  sharqia: 0.72,
  qalyubia: 0.71,
  gharbia: 0.71,
  monufia: 0.7,
  beheira: 0.7,
  kafr_el_sheikh: 0.69,
  beni_suef: 0.78,
  assiut: 0.76,
};

function buildPlan(tier, { budget, citySlug, people, days, tripTypes, lang }) {
  const slug = normalizeSlug(citySlug);
  const city = destinationBySlug(slug);
  const cityName = lang === "ar" ? city?.name_ar : city?.name_en;
  const rates = TIER_RATES[tier];
  const cityFactor = CITY_PRICE_FACTOR[slug] ?? 1;

  const accommodation = Math.round(rates.hotel * days * cityFactor);
  const transport = Math.round(180 * people * 2 * (cityFactor * 0.6 + 0.4));
  const activities = Math.round(rates.activity * people * Math.min(days, 4) * cityFactor);
  const subtotal = accommodation + transport + activities;
  const service_fee = Math.round(subtotal * 0.05);
  const total = subtotal + service_fee;

  const labels = catalogPlanItems(slug, tier, tripTypes, lang);

  return {
    id: `demo-${slug}-${tier}`,
    tier,
    total,
    citySlug: slug,
    cityName,
    cityImage: city ? thumb(city.image, 480) : "",
    cityImageFallback: city?.imageFallback || "",
    aiSummary: catalogSummary(slug, tier, tripTypes, lang),
    breakdown: {
      accommodation,
      transport,
      activities,
      service_fee,
    },
    items: [
      { type: "HOTEL", name: labels.hotel, cost: accommodation },
      { type: "TRANSPORT", name: labels.transport, cost: transport },
      { type: "ACTIVITY", name: labels.activity, cost: activities },
    ],
    within_budget: total <= budget,
    over_budget_by: Math.max(0, total - budget),
    budget_remaining: Math.max(0, budget - total),
  };
}

export async function demoBudgetSearch(criteria) {
  await demoDelay();

  const citySlug = normalizeSlug(criteria.city_slug);
  const {
    budget,
    people_count: people,
    duration_days: days,
    trip_types: tripTypes,
    lang = "ar",
  } = criteria;

  if (!destinationBySlug(citySlug)) {
    throw new Error(lang === "ar" ? "المدينة غير موجودة" : "City not found");
  }

  const tiers = ["economy", "balanced", "comfort"];
  const plans = tiers.map((tier) =>
    buildPlan(tier, { budget, citySlug, people, days, tripTypes, lang })
  );

  const within = plans.filter((p) => p.within_budget);
  const meta = { user_budget: budget, city_slug: citySlug, trip_types: tripTypes };

  if (within.length >= 1) {
    return { status: "success", search_id: "demo", ...meta, plans: within };
  }

  const cheapest = plans[0];
  return {
    status: "insufficient_budget",
    search_id: "demo",
    ...meta,
    user_budget: budget,
    shortfall: cheapest.total - budget,
    closest_plans: plans,
    suggestions: [
      {
        type: "increase_budget",
        message:
          lang === "ar"
            ? `زوّد الميزانية بـ ${Math.ceil(cheapest.total - budget).toLocaleString()} جنيه`
            : `Increase budget by ${Math.ceil(cheapest.total - budget).toLocaleString()} EGP`,
      },
    ],
  };
}

export function getDemoPlan(planId, lang = "ar") {
  const match = planId.match(/^demo-(.+)-(economy|balanced|comfort)$/);
  if (!match) return null;

  const [, citySlug, tier] = match;
  const saved = loadLastSearch() || {};
  return buildPlan(tier, {
    budget: saved.budget || 999999,
    citySlug,
    people: saved.people_count || 2,
    days: saved.duration_days || 5,
    tripTypes: saved.trip_types || ["SEA"],
    lang: saved.lang || lang,
  });
}
