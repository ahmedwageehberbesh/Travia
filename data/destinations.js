import { destinationColor } from "./destination-colors.js";

/** All 27 Egyptian governorates (المحافظات). */
const GOVERNORATE_LIST = [
  { slug: "cairo", name_ar: "القاهرة", name_en: "Cairo" },
  { slug: "giza", name_ar: "الجيزة", name_en: "Giza" },
  { slug: "alexandria", name_ar: "الإسكندرية", name_en: "Alexandria" },
  { slug: "dakahlia", name_ar: "الدقهلية", name_en: "Dakahlia" },
  { slug: "sharqia", name_ar: "الشرقية", name_en: "Sharqia" },
  { slug: "qalyubia", name_ar: "القليوبية", name_en: "Qalyubia" },
  { slug: "gharbia", name_ar: "الغربية", name_en: "Gharbia" },
  { slug: "monufia", name_ar: "المنوفية", name_en: "Monufia" },
  { slug: "beheira", name_ar: "البحيرة", name_en: "Beheira" },
  { slug: "kafr_el_sheikh", name_ar: "كفر الشيخ", name_en: "Kafr El Sheikh" },
  { slug: "damietta", name_ar: "دمياط", name_en: "Damietta" },
  { slug: "port_said", name_ar: "بورسعيد", name_en: "Port Said" },
  { slug: "ismailia", name_ar: "الإسماعيلية", name_en: "Ismailia" },
  { slug: "suez", name_ar: "السويس", name_en: "Suez" },
  { slug: "fayoum", name_ar: "الفيوم", name_en: "Fayoum" },
  { slug: "beni_suef", name_ar: "بني سويف", name_en: "Beni Suef" },
  { slug: "minya", name_ar: "المنيا", name_en: "Minya" },
  { slug: "assiut", name_ar: "أسيوط", name_en: "Assiut" },
  { slug: "sohag", name_ar: "سوهاج", name_en: "Sohag" },
  { slug: "qena", name_ar: "قنا", name_en: "Qena" },
  { slug: "luxor", name_ar: "الأقصر", name_en: "Luxor" },
  { slug: "aswan", name_ar: "أسوان", name_en: "Aswan" },
  { slug: "red_sea", name_ar: "البحر الأحمر", name_en: "Red Sea" },
  { slug: "new_valley", name_ar: "الوادي الجديد", name_en: "New Valley" },
  { slug: "matrouh", name_ar: "مطروح", name_en: "Matrouh" },
  { slug: "north_sinai", name_ar: "شمال سيناء", name_en: "North Sinai" },
  { slug: "south_sinai", name_ar: "جنوب سيناء", name_en: "South Sinai" },
];

/** Old city slugs → governorate (backward compatibility). */
export const SLUG_ALIASES = {
  sharm_el_sheikh: "south_sinai",
  dahab: "south_sinai",
  hurghada: "red_sea",
  marsa_alam: "red_sea",
  siwa: "new_valley",
};

export const EGYPT_DESTINATIONS = GOVERNORATE_LIST.map((d) => ({
  ...d,
  color: destinationColor(d.slug),
}));

export function normalizeSlug(slug) {
  return SLUG_ALIASES[slug] || slug;
}

export function destinationBySlug(slug) {
  const key = normalizeSlug(slug);
  return EGYPT_DESTINATIONS.find((d) => d.slug === key);
}

/** Common city names → governorate slug (for free-text input). */
const CITY_NAME_ALIASES = {
  "شرم الشيخ": "south_sinai",
  شرم: "south_sinai",
  دهب: "south_sinai",
  طابا: "south_sinai",
  نويبع: "south_sinai",
  "سانت كاترين": "south_sinai",
  الغردقة: "red_sea",
  "مرسى علم": "red_sea",
  الغردقه: "red_sea",
  سيوة: "new_valley",
  "الساحل الشمالي": "matrouh",
  "العلمين": "matrouh",
  sharm: "south_sinai",
  dahab: "south_sinai",
  hurghada: "red_sea",
  siwa: "new_valley",
};

function normText(s) {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Match typed governorate/city name to a known destination (best effort). */
export function resolveCityInput(raw, lang = "ar") {
  const input = raw?.trim();
  if (!input) return null;

  const q = normText(input);

  for (const [alias, slug] of Object.entries(CITY_NAME_ALIASES)) {
    if (normText(alias) === q) {
      const dest = destinationBySlug(slug);
      return { slug, name: input, dest, input };
    }
  }

  for (const d of EGYPT_DESTINATIONS) {
    const ar = normText(d.name_ar);
    const en = normText(d.name_en);
    const slugSpaced = d.slug.replace(/_/g, " ");
    if (q === ar || q === en || q === slugSpaced) {
      return { slug: d.slug, name: input, dest: d, input };
    }
  }

  for (const d of EGYPT_DESTINATIONS) {
    const ar = normText(d.name_ar);
    const en = normText(d.name_en);
    if (ar.includes(q) || en.includes(q) || q.includes(ar) || q.includes(en)) {
      return { slug: d.slug, name: input, dest: d, input };
    }
  }

  for (const [alias, slug] of Object.entries(CITY_NAME_ALIASES)) {
    const a = normText(alias);
    if (a.includes(q) || q.includes(a)) {
      const dest = destinationBySlug(slug);
      return { slug, name: input, dest, input };
    }
  }

  return { slug: "cairo", name: input, dest: destinationBySlug("cairo"), input, custom: true };
}

export function destinationName(dest, lang) {
  return lang === "ar" ? dest.name_ar : dest.name_en;
}

export { destinationColor, destinationGradient } from "./destination-colors.js";
