import { destinationBySlug, normalizeSlug } from "./destinations.js";
import { demoDelay } from "./demo-config.js";
import { loadLastSearch, saveGeneratedPlans } from "./demo-plan-details.js";
import { catalogSummary, catalogPlanItems } from "./demo-catalog.js";
import { templateById, templateDisplayName } from "./plan-templates.js";

const TIER_RATES = {
  economy: { hotel: 650, activity: 280, factor: 1 },
  balanced: { hotel: 1200, activity: 450, factor: 1.15 },
  comfort: { hotel: 2400, activity: 750, factor: 1.35 },
  family: { hotel: 1100, activity: 420, factor: 1.1 },
  adventure: { hotel: 900, activity: 520, factor: 1.05 },
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
};

function buildPlan(templateId, { budget, citySlug, people, days, tripTypes, lang }) {
  const slug = normalizeSlug(citySlug);
  const city = destinationBySlug(slug);
  const cityName = lang === "ar" ? city?.name_ar : city?.name_en;
  const rates = TIER_RATES[templateId] || TIER_RATES.balanced;
  const cityFactor = (CITY_PRICE_FACTOR[slug] ?? 1) * rates.factor;
  const catalogTier = ["economy", "balanced", "comfort"].includes(templateId) ? templateId : "balanced";

  const accommodation = Math.round(rates.hotel * days * cityFactor);
  const transport = Math.round(180 * people * 2 * (cityFactor * 0.6 + 0.4));
  const activities = Math.round(rates.activity * people * Math.min(days, 4) * cityFactor);
  const subtotal = accommodation + transport + activities;
  const service_fee = Math.round(subtotal * 0.05);
  const total = subtotal + service_fee;

  const labels = catalogPlanItems(slug, catalogTier, tripTypes, lang);
  const tpl = templateById(templateId);
  const templateName = templateDisplayName(tpl, lang) || templateId;

  return {
    id: `demo-${slug}-${templateId}`,
    tier: templateId,
    templateId,
    templateName,
    total,
    citySlug: slug,
    cityName,
    aiSummary: catalogSummary(slug, catalogTier, tripTypes, lang),
    breakdown: { accommodation, transport, activities, service_fee },
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
    templates = ["economy", "balanced", "comfort"],
    lang = "ar",
  } = criteria;

  if (!destinationBySlug(citySlug)) {
    throw new Error(lang === "ar" ? "المدينة غير موجودة" : "City not found");
  }

  const plans = templates.map((id) =>
    buildPlan(id, { budget, citySlug, people, days, tripTypes, lang })
  );

  const within = plans.filter((p) => p.within_budget);
  const meta = {
    user_budget: budget,
    city_slug: citySlug,
    trip_types: tripTypes,
    templates,
    custom_notes: criteria.custom_notes,
  };

  if (within.length >= 1) {
    const result = { status: "success", search_id: "demo", ...meta, plans: within };
    saveGeneratedPlans(within);
    return result;
  }

  const cheapest = [...plans].sort((a, b) => a.total - b.total)[0];
  const result = {
    status: "insufficient_budget",
    search_id: "demo",
    ...meta,
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
  saveGeneratedPlans(plans);
  return result;
}

export function getDemoPlan(planId, lang = "ar") {
  const match = planId.match(/^demo-(.+)-([a-z_]+)$/);
  if (!match) return null;

  const [, citySlug, templateId] = match;
  const saved = loadLastSearch() || {};
  return buildPlan(templateId, {
    budget: saved.budget || 999999,
    citySlug,
    people: saved.people_count || 2,
    days: saved.duration_days || 5,
    tripTypes: saved.trip_types || ["SEA"],
    lang: saved.lang || lang,
  });
}
