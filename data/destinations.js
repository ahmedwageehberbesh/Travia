import {
  cityHeroUrl,
  GOVERNORATE_HERO_FALLBACK,
  preloadImageWithFallback,
} from "./demo-images.js";

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
  image: cityHeroUrl(d.slug),
  imageFallback: GOVERNORATE_HERO_FALLBACK[d.slug],
}));

export function normalizeSlug(slug) {
  return SLUG_ALIASES[slug] || slug;
}

export function destinationBySlug(slug) {
  const key = normalizeSlug(slug);
  return EGYPT_DESTINATIONS.find((d) => d.slug === key);
}

export function destinationName(dest, lang) {
  return lang === "ar" ? dest.name_ar : dest.name_en;
}

export function preloadDestinationImages(destinations = EGYPT_DESTINATIONS) {
  destinations.forEach((dest) => {
    preloadImageWithFallback(dest.image, dest.imageFallback);
  });
}
