import { GEMINI_CACHE_PREFIX, hasGeminiApiKey } from "./gemini-config.js";
import { geminiGenerateJson } from "./gemini-client.js";
import { destinationBySlug } from "../data/destinations.js";
import { enrichDemoPlan } from "../data/demo-plan-details.js";

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

function cacheKey(type, payload) {
  return GEMINI_CACHE_PREFIX + type + "_" + btoa(unescape(encodeURIComponent(JSON.stringify(payload)))).slice(0, 48);
}

function readCache(key) {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeCache(key, value) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota exceeded — skip cache */
  }
}

function tripTypeNames(types, lang) {
  return types.map((t) => TRIP_TYPE_LABELS[t]?.[lang] || t).join(", ");
}

function mergeReviews(fallback, generated, max = 3) {
  if (!Array.isArray(generated) || !generated.length) return fallback;
  return generated.slice(0, max).map((r, i) => ({
    name: r.name || fallback[i]?.name || "Traveler",
    text: r.text || fallback[i]?.text || "",
    rating: Math.min(5, Math.max(1, Number(r.rating) || fallback[i]?.rating || 5)),
  }));
}

function mergePlanItems(plan, labels) {
  if (!labels) return plan.items;
  const order = ["HOTEL", "TRANSPORT", "ACTIVITY"];
  return plan.items.map((item, i) => ({
    ...item,
    name: labels[order[i]] || item.name,
  }));
}

export async function enhanceSearchResultsWithGemini(data, criteria) {
  if (!hasGeminiApiKey()) return data;

  const plans = data.plans || data.closest_plans;
  if (!plans?.length) return data;

  const key = cacheKey("search", { criteria, ids: plans.map((p) => p.id) });
  const cached = readCache(key);
  if (cached) return applySearchEnhancement(data, cached);

  const city = destinationBySlug(criteria.city_slug);
  const cityName = criteria.lang === "ar" ? city.name_ar : city.name_en;
  const langName = criteria.lang === "ar" ? "Arabic" : "English";

  const prompt = `You are Travia, an Egyptian travel planner. Write catchy trip item labels in ${langName} for these budget plans.

Destination: ${cityName}, Egypt
Trip types: ${tripTypeNames(criteria.trip_types || ["SEA"], criteria.lang)}
People: ${criteria.people_count}, Days: ${criteria.duration_days}, Budget: ${criteria.budget} EGP

Plans:
${plans.map((p) => `- id: ${p.id}, tier: ${p.tier} (${TIER_LABELS[p.tier][criteria.lang]}), total: ${p.total} EGP`).join("\n")}

Return JSON only:
{
  "plans": [
    {
      "id": "demo-city-tier",
      "summary": "one engaging sentence about this trip",
      "items": {
        "hotel": "creative hotel/stay label",
        "transport": "creative transport label",
        "activity": "creative main activity label"
      }
    }
  ]
}`;

  try {
    const ai = await geminiGenerateJson(prompt);
    writeCache(key, ai);
    return applySearchEnhancement(data, ai);
  } catch {
    return data;
  }
}

function applySearchEnhancement(data, ai) {
  if (!ai?.plans?.length) return data;

  const byId = Object.fromEntries(ai.plans.map((p) => [p.id, p]));
  const enhance = (plan) => {
    const gen = byId[plan.id];
    if (!gen) return plan;
    return {
      ...plan,
      aiSummary: gen.summary,
      items: mergePlanItems(plan, gen.items),
    };
  };

  if (data.plans) return { ...data, aiGenerated: true, plans: data.plans.map(enhance) };
  if (data.closest_plans) {
    return { ...data, aiGenerated: true, closest_plans: data.closest_plans.map(enhance) };
  }
  return data;
}

export async function enrichDemoPlanWithGemini(plan, criteria) {
  const base = enrichDemoPlan(plan, criteria);
  if (!hasGeminiApiKey()) return base;

  const key = cacheKey("detail", {
    id: plan.id,
    lang: criteria.lang,
    types: criteria.trip_types,
  });
  const cached = readCache(key);
  if (cached) return mergeDetailContent(base, cached, plan);

  const city = destinationBySlug(criteria.city_slug);
  const cityName = criteria.lang === "ar" ? city.name_ar : city.name_en;
  const langName = criteria.lang === "ar" ? "Arabic" : "English";
  const saved = criteria;
  const activityCount = base.activities.length;

  const prompt = `You are Travia, an expert Egyptian travel writer. Generate vivid, realistic trip content in ${langName} for a ${TIER_LABELS[plan.tier][criteria.lang]} package.

Destination: ${cityName}, Egypt
Tier: ${plan.tier}
Trip types: ${tripTypeNames(criteria.trip_types || ["SEA"], criteria.lang)}
Duration: ${saved.duration_days || 5} days, ${saved.people_count || 2} travelers
Total price: ${plan.total} EGP

Write unique names and descriptions — not generic templates. Mention local landmarks where relevant.

Return JSON only:
{
  "hotel": {
    "name": "hotel name",
    "description": "2-3 sentences",
    "amenities": ["4-6 amenities"]
  },
  "activities": [
    {
      "name": "activity name",
      "description": "2 sentences",
      "duration": "duration text",
      "included": ["3-4 included items"]
    }
  ],
  "transport": {
    "name": "transport label",
    "description": "1-2 sentences"
  },
  "tripReviews": [
    { "name": "reviewer name", "text": "review", "rating": 5 }
  ],
  "itemLabels": {
    "hotel": "short card label for hotel",
    "transport": "short card label for transport",
    "activity": "short card label for activity"
  }
}

Include exactly ${activityCount} activities in the activities array. Include 3 tripReviews.`;

  try {
    const ai = await geminiGenerateJson(prompt);
    writeCache(key, ai);
    return mergeDetailContent(base, ai, plan);
  } catch {
    return base;
  }
}

function mergeDetailContent(base, ai, plan) {
  const activities = base.activities.map((act, i) => {
    const gen = ai.activities?.[i];
    if (!gen) return act;
    return {
      ...act,
      name: gen.name || act.name,
      description: gen.description || act.description,
      duration: gen.duration || act.duration,
      included: Array.isArray(gen.included) && gen.included.length ? gen.included : act.included,
      reviews: mergeReviews(act.reviews, gen.reviews, 2),
    };
  });

  return {
    ...base,
    aiGenerated: true,
    hotel: {
      ...base.hotel,
      name: ai.hotel?.name || base.hotel.name,
      description: ai.hotel?.description || base.hotel.description,
      amenities: Array.isArray(ai.hotel?.amenities) && ai.hotel.amenities.length
        ? ai.hotel.amenities
        : base.hotel.amenities,
      reviews: mergeReviews(base.hotel.reviews, ai.hotel?.reviews, 3),
    },
    activities,
    transport: {
      ...base.transport,
      name: ai.transport?.name || base.transport.name,
      description: ai.transport?.description || base.transport.description,
    },
    tripReviews: mergeReviews(base.tripReviews, ai.tripReviews, 5),
    items: mergePlanItems(plan, ai.itemLabels),
  };
}
