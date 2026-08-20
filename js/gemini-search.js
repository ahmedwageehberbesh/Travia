import { geminiGenerateJson } from "./gemini-client.js";
import { hasGeminiApiKey } from "./gemini-config.js";
import { destinationBySlug, normalizeSlug } from "../data/destinations.js";
import { saveLastSearch, saveGeneratedPlans, loadGeneratedPlans } from "../data/demo-plan-details.js";

const TRIP_TYPE_LABELS = {
  SEA: { ar: "بحر", en: "Sea" },
  RELAXATION: { ar: "استجمام", en: "Relaxation" },
  ADVENTURE: { ar: "مغامرات", en: "Adventure" },
  HERITAGE: { ar: "آثار", en: "Heritage" },
  HONEYMOON: { ar: "شهر عسل", en: "Honeymoon" },
};

const TIER_LABELS = {
  economy: { ar: "اقتصادية", en: "Economy" },
  balanced: { ar: "متوازنة", en: "Balanced" },
  comfort: { ar: "فاخرة", en: "Luxury" },
};

function tripTypeNames(types, lang) {
  return types.map((t) => TRIP_TYPE_LABELS[t]?.[lang] || t).join("، ");
}

function normalizePlan(raw, slug, cityName, budget) {
  const tier = raw.tier;
  const breakdown = {
    accommodation: Math.round(Number(raw.breakdown?.accommodation) || 0),
    transport: Math.round(Number(raw.breakdown?.transport) || 0),
    activities: Math.round(Number(raw.breakdown?.activities) || 0),
    service_fee: Math.round(Number(raw.breakdown?.service_fee) || 0),
  };
  const total = Math.round(Number(raw.total) || Object.values(breakdown).reduce((s, v) => s + v, 0));

  return {
    id: raw.id || `demo-${slug}-${tier}`,
    tier,
    total,
    citySlug: slug,
    cityName,
    aiSummary: raw.summary || "",
    breakdown,
    items: [
      { type: "HOTEL", name: raw.items?.hotel || raw.items?.HOTEL || "", cost: breakdown.accommodation },
      { type: "TRANSPORT", name: raw.items?.transport || raw.items?.TRANSPORT || "", cost: breakdown.transport },
      { type: "ACTIVITY", name: raw.items?.activity || raw.items?.ACTIVITY || "", cost: breakdown.activities },
    ],
    within_budget: total <= budget,
    over_budget_by: Math.max(0, total - budget),
    budget_remaining: Math.max(0, budget - total),
  };
}

function buildPrompt(criteria, cityName) {
  const lang = criteria.lang === "ar" ? "Arabic" : "English";
  const types = tripTypeNames(criteria.trip_types || ["SEA"], criteria.lang);

  return `You are Travia, an expert Egyptian travel planner. Generate 3 realistic trip plans in ${lang} for Egypt.

Destination: ${cityName}
Trip types: ${types}
Budget: ${criteria.budget} EGP (strict maximum for "within budget" plans)
Travelers: ${criteria.people_count}
Duration: ${criteria.duration_days} days

Create exactly 3 tiers: economy, balanced, comfort.
- Use realistic Egyptian prices in EGP for ${cityName}.
- service_fee = 5% of (accommodation + transport + activities).
- total = sum of all breakdown fields.
- Names and summaries must be creative and specific to ${cityName}, not generic.
- If ALL tiers exceed the budget, set status to "insufficient_budget" and still return all 3 plans.

Return JSON only:
{
  "status": "success" or "insufficient_budget",
  "shortfall": number (only if insufficient, = cheapest plan total - budget),
  "suggestion_message": "helpful tip in ${lang}",
  "plans": [
    {
      "id": "demo-${normalizeSlug(criteria.city_slug)}-economy",
      "tier": "economy",
      "total": number,
      "summary": "one engaging sentence",
      "breakdown": {
        "accommodation": number,
        "transport": number,
        "activities": number,
        "service_fee": number
      },
      "items": {
        "hotel": "creative hotel/stay label",
        "transport": "creative transport label",
        "activity": "creative main activity label"
      }
    }
  ]
}

Include balanced and comfort tiers with ids demo-${normalizeSlug(criteria.city_slug)}-balanced and demo-${normalizeSlug(criteria.city_slug)}-comfort.`;
}

export async function geminiBudgetSearch(criteria) {
  if (!hasGeminiApiKey()) {
    const msg =
      criteria.lang === "ar"
        ? "محتاج مفتاح Gemini — اضغط ✨ Gemini في الأعلى"
        : "Gemini API key required — click ✨ Gemini in the nav";
    throw new Error(msg);
  }

  const slug = normalizeSlug(criteria.city_slug);
  const city = destinationBySlug(slug);
  if (!city) {
    throw new Error(criteria.lang === "ar" ? "المدينة غير موجودة" : "City not found");
  }

  const cityName = criteria.lang === "ar" ? city.name_ar : city.name_en;
  const budget = Number(criteria.budget);

  const ai = await geminiGenerateJson(buildPrompt(criteria, cityName));
  if (!ai?.plans?.length) {
    throw new Error(criteria.lang === "ar" ? "Gemini لم يرجع خطط" : "Gemini returned no plans");
  }

  const plans = ai.plans.map((p) => normalizePlan(p, slug, cityName, budget));
  saveLastSearch(criteria);
  saveGeneratedPlans(plans);

  const meta = {
    user_budget: budget,
    city_slug: slug,
    trip_types: criteria.trip_types,
    aiGenerated: true,
    search_id: "gemini",
  };

  const within = plans.filter((p) => p.within_budget);

  if (ai.status === "insufficient_budget" || within.length === 0) {
    const cheapest = [...plans].sort((a, b) => a.total - b.total)[0];
    return {
      status: "insufficient_budget",
      ...meta,
      shortfall: ai.shortfall ?? Math.max(0, cheapest.total - budget),
      closest_plans: plans,
      suggestions: ai.suggestion_message
        ? [{ type: "increase_budget", message: ai.suggestion_message }]
        : [],
    };
  }

  return { status: "success", ...meta, plans: within.length ? within : plans };
}

export function getGeneratedPlan(planId) {
  const plans = loadGeneratedPlans();
  return plans?.find((p) => p.id === planId) || null;
}
