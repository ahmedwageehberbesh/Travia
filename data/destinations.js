import {
  cityHeroUrl,
  CITY_HERO_FALLBACK,
  preloadImageWithFallback,
} from "./demo-images.js";

export const EGYPT_DESTINATIONS = [
  { slug: "sharm_el_sheikh", name_ar: "شرم الشيخ", name_en: "Sharm El Sheikh" },
  { slug: "hurghada", name_ar: "الغردقة", name_en: "Hurghada" },
  { slug: "marsa_alam", name_ar: "مرسى علم", name_en: "Marsa Alam" },
  { slug: "dahab", name_ar: "دهب", name_en: "Dahab" },
  { slug: "cairo", name_ar: "القاهرة", name_en: "Cairo" },
  { slug: "luxor", name_ar: "الأقصر", name_en: "Luxor" },
  { slug: "aswan", name_ar: "أسوان", name_en: "Aswan" },
  { slug: "alexandria", name_ar: "الإسكندرية", name_en: "Alexandria" },
  { slug: "siwa", name_ar: "سيوة", name_en: "Siwa Oasis" },
].map((d) => ({
  ...d,
  image: cityHeroUrl(d.slug),
  imageFallback: CITY_HERO_FALLBACK[d.slug],
}));

export function destinationBySlug(slug) {
  return EGYPT_DESTINATIONS.find((d) => d.slug === slug);
}

export function destinationName(dest, lang) {
  return lang === "ar" ? dest.name_ar : dest.name_en;
}

export function preloadDestinationImages(destinations = EGYPT_DESTINATIONS) {
  destinations.forEach((dest) => {
    preloadImageWithFallback(dest.image, dest.imageFallback);
  });
}
