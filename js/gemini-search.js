import { geminiGenerateJson } from "./gemini-client.js";
import { hasGeminiApiKey } from "./gemini-config.js";
import { destinationBySlug, normalizeSlug, resolveCityInput } from "../data/destinations.js";
import { templateById, templateHint } from "../data/plan-templates.js";
import { saveLastSearch, saveGeneratedPlans } from "../data/demo-plan-details.js";
import { getPlanById } from "../data/demo-search.js";
import { normalizeImageSlots } from "./plan-images.js";
const TRIP_TYPE_LABELS = {
  SEA: { ar: "بحر", en: "Sea" },
  RELAXATION: { ar: "استجمام", en: "Relaxation" },
  ADVENTURE: { ar: "مغامرات", en: "Adventure" },
  HERITAGE: { ar: "آثار", en: "Heritage" },
  HONEYMOON: { ar: "شهر عسل", en: "Honeymoon" },
};

function tripTypeNames(types, lang) {
  return types.map((t) => TRIP_TYPE_LABELS[t]?.[lang] || t).join("، ");
}

function normalizePlan(raw, slug, cityName, budget, templateId, lang) {
  const breakdown = {
    accommodation: Math.round(Number(raw.breakdown?.accommodation) || 0),
    transport: Math.round(Number(raw.breakdown?.transport) || 0),
    activities: Math.round(Number(raw.breakdown?.activities) || 0),
    service_fee: Math.round(Number(raw.breakdown?.service_fee) || 0),
  };
  const total = Math.round(Number(raw.total) || Object.values(breakdown).reduce((s, v) => s + v, 0));
  const tier = raw.tier || templateId;

  return {
    id: raw.id || `demo-${slug}-${tier}`,
    tier,
    templateId: raw.template_id || templateId,
    templateName: raw.template_name || "",
    total,
    citySlug: slug,
    cityName,
    aiSummary: raw.summary || "",
    aiDetail: raw.detail_intro || raw.summary || "",
    highlights: Array.isArray(raw.highlights) ? raw.highlights : [],
    imageSlots: normalizeImageSlots(raw.images, cityName, lang),
    breakdown,
    items: [
      { type: "HOTEL", name: raw.items?.hotel || raw.items?.HOTEL || "", cost: breakdown.accommodation },
      { type: "TRANSPORT", name: raw.items?.transport || raw.items?.TRANSPORT || "", cost: breakdown.transport },
      { type: "ACTIVITY", name: raw.items?.activity || raw.items?.ACTIVITY || "", cost: breakdown.activities },
    ],
    within_budget: total <= budget,
    over_budget_by: Math.max(0, total - budget),
    budget_remaining: Math.max(0, budget - total),
    aiGenerated: true,
  };
}
function buildPrompt(criteria, cityName, templates) {
  const lang = criteria.lang === "ar" ? "Arabic" : "English";
  const types = tripTypeNames(criteria.trip_types || ["SEA"], criteria.lang);
  const custom = criteria.custom_notes?.trim();
  const slug = normalizeSlug(criteria.city_slug);

  const templateLines = templates
    .map((tpl) => `- template_id: "${tpl.id}", style: ${templateHint(tpl, criteria.lang)}`)
    .join("\n");

  return `You are Travia, an expert Egyptian travel planner. Generate ${templates.length} DISTINCT trip plan templates in ${lang} for Egypt.

Destination: ${cityName}
Trip types: ${types}
Budget: ${criteria.budget} EGP (each plan should try to fit within budget when possible)
Travelers: ${criteria.people_count}
Duration: ${criteria.duration_days} days
${custom ? `Custom user requests (MUST honor): ${custom}` : ""}

Generate exactly one plan for EACH template — each must feel different:
${templateLines}

Rules:
- Realistic Egyptian EGP prices for ${cityName}.
- service_fee = 5% of (accommodation + transport + activities).
- total = sum of breakdown.
- template_name = short catchy label in ${lang}.
- tier = template_id.
- summary = 2-3 engaging sentences describing this specific trip.
- detail_intro = one extra paragraph with local flavor and what makes this plan special.
- highlights = 3 short bullet points (strings).
- images = descriptive captions ONLY (no URLs) for empty photo placeholders later.
- If all exceed budget, status = "insufficient_budget".

Return JSON only:
{
  "status": "success" or "insufficient_budget",
  "shortfall": number,
  "suggestion_message": "tip in ${lang}",
  "plans": [{
    "id": "demo-${slug}-TEMPLATE_ID",
    "template_id": "TEMPLATE_ID",
    "template_name": "name",
    "tier": "TEMPLATE_ID",
    "total": number,
    "summary": "2-3 sentences",
    "detail_intro": "paragraph",
    "highlights": ["point1", "point2", "point3"],
    "images": {
      "hero": "main destination caption",
      "hotel": ["room caption", "pool caption", "view caption"],
      "activities": ["main activity caption"],
      "transport": "transport caption"
    },
    "breakdown": { "accommodation": n, "transport": n, "activities": n, "service_fee": n },
    "items": { "hotel": "label", "transport": "label", "activity": "label" }
  }]
}`;
}

export async function geminiBudgetSearch(criteria) {
  if (!hasGeminiApiKey()) {
    throw new Error(
      criteria.lang === "ar"
        ? "محتاج مفتاح Gemini — اضغط ✨ Gemini"
        : "Gemini API key required"
    );
  }

  const lang = criteria.lang || "ar";
  const resolved = criteria.city_name
    ? resolveCityInput(criteria.city_name, lang)
    : criteria.city_slug
      ? { slug: normalizeSlug(criteria.city_slug), dest: destinationBySlug(criteria.city_slug), name: "" }
      : null;

  if (!resolved?.slug) {
    throw new Error(lang === "ar" ? "اكتب اسم المحافظة أو المدينة" : "Enter a destination");
  }

  const slug = resolved.slug;
  const city = resolved.dest || destinationBySlug(slug);

  const templates = (criteria.templates || []).map((id) => templateById(id)).filter(Boolean);
  if (!templates.length) {
    throw new Error(lang === "ar" ? "اختار قالب واحد على الأقل" : "Select at least one template");
  }

  const cityName =
    criteria.city_name?.trim() ||
    resolved.name ||
    (lang === "ar" ? city?.name_ar : city?.name_en);
  const budget = Number(criteria.budget);
  const ai = await geminiGenerateJson(buildPrompt(criteria, cityName, templates));
  if (!ai?.plans?.length) {
    throw new Error(criteria.lang === "ar" ? "Gemini لم يرجع خطط" : "Gemini returned no plans");
  }

  const plans = ai.plans.map((p) =>
    normalizePlan(p, slug, cityName, budget, p.template_id || p.tier, lang)
  );  saveLastSearch(criteria);
  saveGeneratedPlans(plans);

  const meta = {
    user_budget: budget,
    city_slug: slug,
    city_name: cityName,
    trip_types: criteria.trip_types,
    templates: criteria.templates,
    custom_notes: criteria.custom_notes,
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
      suggestions: ai.suggestion_message ? [{ type: "increase_budget", message: ai.suggestion_message }] : [],
    };
  }

  return { status: "success", ...meta, plans: within.length ? within : plans };
}

export function getGeneratedPlan(planId) {
  return getPlanById(planId);
}
