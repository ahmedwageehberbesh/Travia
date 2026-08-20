import { destinationBySlug } from "./destinations.js";
import { demoDelay } from "./demo-config.js";
import { loadLastSearch } from "./demo-plan-details.js";

const TIER_RATES = {
  economy: { hotel: 650, activity: 280 },
  balanced: { hotel: 1200, activity: 450 },
  comfort: { hotel: 2400, activity: 750 },
};

/** Per-city price factor so plans visibly change by destination. */
const CITY_PRICE_FACTOR = {
  sharm_el_sheikh: 1.15,
  hurghada: 1.0,
  marsa_alam: 0.95,
  dahab: 0.82,
  cairo: 0.9,
  luxor: 0.88,
  aswan: 0.86,
  alexandria: 0.92,
  siwa: 0.78,
};

const ACTIVITY_NAMES = {
  SEA: { ar: "رحلة غوص و snorkeling", en: "Snorkeling trip" },
  RELAXATION: { ar: "جلسة spa واسترخاء", en: "Spa & relaxation" },
  ADVENTURE: { ar: "سفاري صحراوية", en: "Desert safari" },
  HERITAGE: { ar: "جولة آثار ومتاحف", en: "Heritage tour" },
  HONEYMOON: { ar: "عشاء رومانسي على البحر", en: "Romantic dinner cruise" },
};

function pickActivity(tripTypes, lang) {
  const type = tripTypes[0] || "SEA";
  const names = ACTIVITY_NAMES[type] || ACTIVITY_NAMES.SEA;
  return lang === "ar" ? names.ar : names.en;
}

function buildPlan(tier, { budget, citySlug, people, days, tripTypes, lang }) {
  const city = destinationBySlug(citySlug);
  const cityName = lang === "ar" ? city?.name_ar : city?.name_en;
  const rates = TIER_RATES[tier];
  const cityFactor = CITY_PRICE_FACTOR[citySlug] ?? 1;

  const accommodation = Math.round(rates.hotel * days * cityFactor);
  const transport = Math.round(180 * people * 2 * (cityFactor * 0.6 + 0.4));
  const activities = Math.round(rates.activity * people * Math.min(days, 4) * cityFactor);
  const subtotal = accommodation + transport + activities;
  const service_fee = Math.round(subtotal * 0.05);
  const total = subtotal + service_fee;

  const hotelLabel =
    lang === "ar"
      ? `إقامة ${tier === "economy" ? "3 نجوم" : tier === "balanced" ? "4 نجوم" : "5 نجوم"} — ${cityName}`
      : `${tier === "economy" ? "3-star" : tier === "balanced" ? "4-star" : "5-star"} stay — ${cityName}`;

  const transportLabel =
    lang === "ar" ? "نقل مشترك من وإلى المطار" : "Shared airport transfer";

  return {
    id: `demo-${citySlug}-${tier}`,
    tier,
    total,
    breakdown: {
      accommodation,
      transport,
      activities,
      service_fee,
    },
    items: [
      { type: "HOTEL", name: hotelLabel, cost: accommodation },
      { type: "TRANSPORT", name: transportLabel, cost: transport },
      { type: "ACTIVITY", name: pickActivity(tripTypes, lang), cost: activities },
    ],
    within_budget: total <= budget,
    over_budget_by: Math.max(0, total - budget),
  };
}

/**
 * Frontend-only demo search — mimics backend response shape.
 */
export async function demoBudgetSearch(criteria) {
  await demoDelay();

  const {
    budget,
    city_slug: citySlug,
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

  if (within.length >= 3) {
    return { status: "success", search_id: "demo", plans: within };
  }

  if (within.length > 0) {
    return { status: "success", search_id: "demo", plans: within };
  }

  const cheapest = plans[0];
  return {
    status: "insufficient_budget",
    search_id: "demo",
    user_budget: budget,
    shortfall: cheapest.total - budget,
    closest_plans: plans,
    suggestions: [
      {
        type: "increase_budget",
        message:
          lang === "ar"
            ? `زوّد الميزانية بـ ${Math.ceil(cheapest.total - budget)} جنيه`
            : `Increase budget by ${Math.ceil(cheapest.total - budget)} EGP`,
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
