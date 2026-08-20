/** خطط تجريبية ثابتة — دهب / شرm الشيikh (هاردكود) — Gemini يكمّل الباقي */

export const HARDCODED_SHARM = {
  id: "demo-south_sinai-balanced",
  citySlug: "south_sinai",
  cityNameAr: "\u0634\u0631\u0645 \u0627\u0644\u0634\u064a\u062e",
  cityNameEn: "Sharm El Sheikh",
  templateId: "balanced",
  budget: 28000,
  people: 2,
  days: 5,
  tripTypes: ["SEA", "RELAXATION"],
  summaryAr:
    "\u0631\u062d\u0644\u0629 \u0645\u062a\u0648\u0627\u0632\u0646\u0629 \u0644\u0634\u0631\u0645 \u0627\u0644\u0634\u064a\u062e: \u0625\u0642\u0627\u0645\u0629 4 \u0646\u062c\u0648\u0645 \u0639\u0644\u0649 \u0627\u0644\u0628\u062d\u0631\u060c \u063a\u0648\u0635 \u0641\u064a \u0631\u0623\u0633 \u0645\u062d\u0645\u062f\u060c \u0648\u0633\u0641\u0627\u0631\u064a \u0628\u0633\u064a\u0637 \u0641\u064a \u0627\u0644\u0635\u062d\u0631\u0627\u0621.",
  summaryEn:
    "Balanced Sharm El Sheikh trip: 4-star beach stay, Ras Mohammed snorkeling, and a light desert safari.",
  detailAr:
    "\u0627\u0644\u062e\u0637\u0629 \u062f\u064a \u0628\u062a\u062c\u0645\u0639 \u0628\u064a\u0646 \u0627\u0644\u0628\u062d\u0631 \u0648\u0627\u0644\u0627\u0633\u062a\u062c\u0645\u0627\u0645 \u0641\u064a \u0646\u0639\u0645\u0629 \u0628\u0627\u064a \u0648\u0627\u0644\u0633\u0648\u0642 \u0627\u0644\u0642\u062f\u064a\u0645. \u0625\u0642\u0627\u0645\u0629 \u0642\u0631\u064a\u0628\u0629 \u0645\u0646 \u0627\u0644\u0634\u0627\u0637\u0626 \u0645\u0639 \u0623\u0646\u0634\u0637\u0629 \u063a\u0648\u0635 \u0648 snorkeling.",
  detailEn:
    "Sea and relaxation in Naama Bay and Old Market — beachfront-style stay with snorkeling and a relaxed market stroll.",
  highlightsAr: [
    "\u063a\u0648\u0635 \u0641\u064a \u0645\u062d\u0645\u064a\u0629 \u0631\u0623\u0633 \u0645\u062d\u0645\u062f",
    "\u0625\u0642\u0627\u0645\u0629 4 \u0646\u062c\u0648\u0645 \u0639\u0644\u0649 \u0627\u0644\u0628\u062d\u0631",
    "\u0646\u0642\u0644 \u062e\u0627\u0635 \u0645\u0646 \u0627\u0644\u0645\u0637\u0627\u0631",
  ],
  highlightsEn: ["Ras Mohammed snorkeling", "4-star beach stay", "Private airport transfer"],
  imageSlots: {
    ar: {
      hero: "\u062e\u0644\u064a\u062c \u0646\u0639\u0645\u0629 \u2014 \u0634\u0631\u0645 \u0627\u0644\u0634\u064a\u062e",
      hotel: ["\u063a\u0631\u0641\u0629 \u0645\u0637\u0644\u0629 \u0639\u0644\u0649 \u0627\u0644\u0628\u062d\u0631", "\u0645\u0633\u0628\u062d", "\u0625\u0637\u0644\u0627\u0644\u0629 \u062e\u0644\u064a\u062c \u0646\u0639\u0645\u0629"],
      activities: ["\u063a\u0648\u0635 \u0631\u0623\u0633 \u0645\u062d\u0645\u062f", "\u0633\u0648\u0642 \u0634\u0631\u0645 \u0627\u0644\u0642\u062f\u064a\u0645"],
      transport: "\u0646\u0642\u0644 \u062e\u0627\u0635 \u0645\u0646 \u0645\u0637\u0627\u0631 \u0634\u0631\u0645",
    },
    en: {
      hero: "Naama Bay — Sharm El Sheikh",
      hotel: ["Sea-view room", "Pool", "Naama Bay view"],
      activities: ["Ras Mohammed dive", "Old Sharm market"],
      transport: "Private Sharm airport transfer",
    },
  },
};

export const HARDCODED_DAHAB = {
  id: "demo-south_sinai-economy",
  citySlug: "south_sinai",
  cityNameAr: "\u062f\u0647\u0628",
  cityNameEn: "Dahab",
  templateId: "economy",
  budget: 18000,
  people: 2,
  days: 4,
  tripTypes: ["SEA", "ADVENTURE"],
  summaryAr:
    "\u0631\u062d\u0644\u0629 \u0627\u0642\u062a\u0635\u0627\u062f\u064a\u0629 \u0644\u062f\u0647\u0628: \u0625\u0642\u0627\u0645\u0629 \u0628\u0633\u064a\u0637\u0629 \u0639\u0644\u0649 \u0627\u0644\u0628\u062d\u0631\u060c snorkeling \u0641\u064a Blue Hole\u060c \u0648\u0631\u062d\u0644\u0629 \u062c\u0628\u0644\u064a\u0629 \u062e\u0641\u064a\u0641\u0629.",
  summaryEn:
    "Budget Dahab trip: simple beach stay, Blue Hole snorkeling, and a light hike.",
  detailAr:
    "\u062f\u0647\u0628 \u0623\u0647\u062f\u0623 \u0645\u0646 \u0634\u0631\u0645 \u2014 \u0637\u0628\u064a\u0639\u0629 \u0648\u063a\u0648\u0635 \u0645\u0646 \u0627\u0644\u0634\u0627\u0637\u0626. \u0641\u0646\u062f\u0642 3 \u0646\u062c\u0648\u0645 \u0641\u064a \u0644\u0627\u063a\u0648\u0646\u0627 \u0645\u0639 snorkeling \u0648\u0645\u0634\u064a \u0639\u0644\u0649 \u0627\u0644\u0643\u0648\u0631\u0646\u064a\u0634.",
  detailEn:
    "Quieter than Sharm — shore diving and nature. 3-star Laguna area hotel with snorkeling and corniche walks.",
  highlightsAr: ["Blue Hole snorkeling", "\u0625\u0642\u0627\u0645\u0629 \u0627\u0642\u062a\u0635\u0627\u062f\u064a\u0629", "\u062c\u0648\u0644\u0629 Laguna"],
  highlightsEn: ["Blue Hole snorkeling", "Budget beach stay", "Laguna tour"],
  imageSlots: {
    ar: {
      hero: "\u0634\u0627\u0637\u0626 \u062f\u0647\u0628 \u0648\u0627\u0644\u062c\u0628\u0627\u0644",
      hotel: ["\u063a\u0631\u0641\u0629 \u0639\u0644\u0649 \u0627\u0644\u0628\u062d\u0631", "\u062a\u0631\u0627\u0633", "Blue Hole"],
      activities: ["snorkeling Blue Hole", "\u0643\u0648\u0631\u0646\u064a\u0634 \u062f\u0647\u0628"],
      transport: "\u0646\u0642\u0644 \u0645\u0634\u062a\u0631\u0643",
    },
    en: {
      hero: "Dahab beach and mountains",
      hotel: ["Beach room", "Terrace", "Blue Hole view"],
      activities: ["Blue Hole snorkeling", "Dahab corniche"],
      transport: "Shared transfer",
    },
  },
};

export function pickSampleConfig(planId, saved = {}) {
  const hint = `${planId || ""} ${saved.city_name || ""} ${saved.city_slug || ""}`;
  if (/dahab|دهب/i.test(hint)) return HARDCODED_DAHAB;
  return HARDCODED_SHARM;
}

export function applySampleContent(plan, cfg, lang) {
  const cityName = lang === "ar" ? cfg.cityNameAr : cfg.cityNameEn;
  const slots = cfg.imageSlots[lang] || cfg.imageSlots.ar;
  return {
    ...plan,
    id: cfg.id,
    citySlug: cfg.citySlug,
    cityName,
    aiSummary: lang === "ar" ? cfg.summaryAr : cfg.summaryEn,
    aiDetail: lang === "ar" ? cfg.detailAr : cfg.detailEn,
    highlights: lang === "ar" ? cfg.highlightsAr : cfg.highlightsEn,
    imageSlots: slots,
    isSamplePlan: true,
  };
}

export function defaultSamplePlanId(saved = {}) {
  return pickSampleConfig(null, saved).id;
}
