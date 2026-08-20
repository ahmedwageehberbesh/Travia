/** Empty image slots — captions only, no external URLs. */

export function defaultPlanImages(cityName, lang = "ar") {
  const city = cityName || (lang === "ar" ? "الوجهة" : "destination");
  if (lang === "ar") {
    return {
      hero: `منظر ${city}`,
      hotel: [`غرفة في ${city}`, "المسبح", "إطلالة"],
      activities: [`نشاط في ${city}`],
      transport: "المواصلات",
    };
  }
  return {
    hero: `${city} view`,
    hotel: [`Room in ${city}`, "Pool", "View"],
    activities: [`Activity in ${city}`],
    transport: "Transport",
  };
}

export function normalizeImageSlots(raw, cityName, lang) {
  const fallback = defaultPlanImages(cityName, lang);
  const hotel = Array.isArray(raw?.hotel) ? raw.hotel : raw?.hotel ? [raw.hotel] : fallback.hotel;
  const activities = Array.isArray(raw?.activities) ? raw.activities : fallback.activities;
  return {
    hero: raw?.hero || fallback.hero,
    hotel: hotel.filter(Boolean).slice(0, 4),
    activities: activities.filter(Boolean).slice(0, 4),
    transport: raw?.transport || fallback.transport,
  };
}

export function renderImagePlaceholder(caption, size = "md") {
  const label = caption || "";
  return `
    <figure class="image-placeholder image-placeholder--${size}">
      <div class="image-placeholder-box" aria-hidden="true">
        <span class="image-placeholder-icon">🖼</span>
      </div>
      <figcaption>${label}</figcaption>
    </figure>`;
}

export function renderImageGrid(captions, size = "md") {
  const list = (Array.isArray(captions) ? captions : [captions]).filter(Boolean);
  if (!list.length) return "";
  return `<div class="image-placeholder-grid">${list.map((c) => renderImagePlaceholder(c, size)).join("")}</div>`;
}
