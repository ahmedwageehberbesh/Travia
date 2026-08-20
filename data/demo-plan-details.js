import { destinationBySlug } from "./destinations.js";

const HOTEL_META = {
  economy: { stars: 3 },
  balanced: { stars: 4 },
  comfort: { stars: 5 },
};

const IMG_CAPTIONS = {
  "plan.img_room": { ar: "غرفة مزدوجة", en: "Double room" },
  "plan.img_pool": { ar: "المسبح", en: "Pool area" },
  "plan.img_view": { ar: "إطلالة بحرية", en: "Sea view" },
  "plan.img_dining": { ar: "المطعم", en: "Restaurant" },
  "plan.img_from_trip": { ar: "من الرحلة", en: "From the trip" },
};

const REVIEW_POOL = {
  ar: [
    { name: "سارة محمود", text: "تجربة رائعة! الفندق نظيف والموقع ممتاز، والأنشطة كانت منظمة جداً.", rating: 5 },
    { name: "أحمد حسن", text: "قيمة مقابل سعر ممتازة. النقل كان في الموعد والغرف مريحة.", rating: 4 },
    { name: "نور الدين", text: "رحلة العائلة كانت ممتعة، الأطفال حبوا رحلة الغوص!", rating: 5 },
    { name: "مريم علي", text: "خدمة جيدة بشكل عام، أنصح بها لمن يبحث عن رحلة اقتصادية.", rating: 4 },
    { name: "كريم فتحي", text: "الفندق فاخر فعلاً، الإفطار متنوع والإطلالة خلابة.", rating: 5 },
  ],
  en: [
    { name: "Sarah M.", text: "Amazing experience! Clean hotel, great location, well-organized activities.", rating: 5 },
    { name: "Ahmed H.", text: "Excellent value for money. Transfer was on time and rooms were comfy.", rating: 4 },
    { name: "Nour E.", text: "Family trip was fun — kids loved the snorkeling!", rating: 5 },
    { name: "Mariam A.", text: "Good service overall, recommended for budget-friendly trips.", rating: 4 },
    { name: "Karim F.", text: "Truly luxury hotel, varied breakfast and stunning views.", rating: 5 },
  ],
};

function caption(key, lang) {
  return IMG_CAPTIONS[key]?.[lang] || key;
}

function stars(n) {
  return "★".repeat(n) + "☆".repeat(5 - n);
}

function hotelDetail(citySlug, tier, lang) {
  const city = destinationBySlug(citySlug);
  const cityName = lang === "ar" ? city.name_ar : city.name_en;
  const meta = HOTEL_META[tier];
  const tierLabel =
    lang === "ar"
      ? tier === "economy"
        ? "اقتصادي"
        : tier === "balanced"
          ? "متوازن"
          : "فاخر"
      : tier === "economy"
        ? "Economy"
        : tier === "balanced"
          ? "Balanced"
          : "Luxury";

  const name =
    lang === "ar"
      ? `فندق ${cityName} ${meta.stars} نجوم`
      : `${cityName} ${meta.stars}-Star Hotel`;

  const amenities =
    lang === "ar"
      ? ["واي فاي مجاني", "مسبح", "إفطار مشمول", "تكييف", "شاطئ خاص", "خدمة غرف 24 ساعة"].slice(
          0,
          tier === "economy" ? 4 : 6
        )
      : ["Free WiFi", "Swimming pool", "Breakfast included", "A/C", "Private beach", "24h room service"].slice(
          0,
          tier === "economy" ? 4 : 6
        );

  const description =
    lang === "ar"
      ? `فندق ${tierLabel} في قلب ${cityName}، يوفر إقامة مريحة على البحر مع خدمات عالية الجودة. الغرف مطلة على المناظر الطبيعية ومناسبة للعائلات والأزواج.`
      : `A ${tierLabel.toLowerCase()} beachfront hotel in ${cityName} with quality service, scenic rooms, and family-friendly amenities.`;

  return {
    name,
    stars: meta.stars,
    rating: tier === "comfort" ? 4.8 : tier === "balanced" ? 4.5 : 4.2,
    reviewCount: tier === "comfort" ? 312 : tier === "balanced" ? 186 : 94,
    address: lang === "ar" ? `${cityName}، مصر` : `${cityName}, Egypt`,
    description,
    amenities,
    reviews: REVIEW_POOL[lang].slice(0, tier === "comfort" ? 3 : 2),
  };
}

function activitiesDetail(citySlug, tripTypes, tier, lang) {
  const city = destinationBySlug(citySlug);
  const cityName = lang === "ar" ? city.name_ar : city.name_en;
  const primary = tripTypes[0] || "SEA";

  const catalog = {
    SEA: {
      ar: { name: "رحلة غوص و snorkeling", desc: "رحلة قارب 4 ساعات مع مرشد، معدات غوص، ووجبة خفيفة.", duration: "4 ساعات" },
      en: { name: "Snorkeling trip", desc: "4-hour boat trip with guide, snorkeling gear, and light snacks.", duration: "4 hours" },
    },
    RELAXATION: {
      ar: { name: "جلسة spa واسترخاء", desc: "مساج 60 دقيقة + Jacuzzi + منطقة استرخاء بإطلالة على البحر.", duration: "2 ساعة" },
      en: { name: "Spa & relaxation", desc: "60-min massage, jacuzzi, and sea-view lounge access.", duration: "2 hours" },
    },
    ADVENTURE: {
      ar: { name: "سفاري صحراوية", desc: "جولة بالسيارة 4x4، عشاء بدوي، وعروض فولكلورية.", duration: "6 ساعات" },
      en: { name: "Desert safari", desc: "4x4 dune tour, Bedouin dinner, and folk show.", duration: "6 hours" },
    },
    HERITAGE: {
      ar: { name: "جولة آثار", desc: "زيارة معبد ومتحف مع مرشد سياحي مرخص.", duration: "5 ساعات" },
      en: { name: "Heritage tour", desc: "Temple and museum visit with licensed guide.", duration: "5 hours" },
    },
    HONEYMOON: {
      ar: { name: "عشاء رومانسي", desc: "عشاء على يacht خاص مع موسيقى حية.", duration: "3 ساعات" },
      en: { name: "Romantic dinner cruise", desc: "Private yacht dinner with live music.", duration: "3 hours" },
    },
  };

  const primaryAct = catalog[primary]?.[lang] || catalog.SEA[lang];
  const extra =
    lang === "ar"
      ? { name: `جولة في ${cityName}`, desc: "جولة مرشدة في أهم معالم المدينة.", duration: "3 ساعات" }
      : { name: `${cityName} city tour`, desc: "Guided tour of top city highlights.", duration: "3 hours" };

  const acts = [{ ...primaryAct, imageKey: primary }];
  if (tier !== "economy") acts.push({ ...extra, imageKey: "CITY_TOUR" });

  return acts.map((a, i) => ({
    name: a.name,
    description: a.desc,
    duration: a.duration,
    included:
      lang === "ar"
        ? ["مرشد", "نقل من الفندق", "تأمين", ...(tier === "comfort" ? ["صور مجانية"] : [])]
        : ["Guide", "Hotel pickup", "Insurance", ...(tier === "comfort" ? ["Free photos"] : [])],
    reviews: REVIEW_POOL[lang].slice(i, i + 2),
  }));
}

function transportDetail(lang, tier) {
  return {
    name: lang === "ar" ? "نقل من وإلى المطار" : "Airport transfer",
    description:
      lang === "ar"
        ? tier === "comfort"
          ? "سيارة خاصة مكيفة مع سائق — ذهاب وعودة."
          : "أتوبيس مشترك مكيف — ذهاب وعودة."
        : tier === "comfort"
          ? "Private A/C car with driver — round trip."
          : "Shared A/C bus — round trip.",
    duration: lang === "ar" ? "45–60 دقيقة" : "45–60 min",
  };
}

export function enrichDemoPlan(plan, criteria) {
  const { city_slug, trip_types = ["SEA"], lang = "ar" } = criteria;
  const city = destinationBySlug(city_slug);
  const hotel = hotelDetail(city_slug, plan.tier, lang);
  const activities = activitiesDetail(city_slug, trip_types, plan.tier, lang);
  const transport = transportDetail(lang, plan.tier);
  const allReviews = REVIEW_POOL[lang];

  const avgRating = (
    allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length
  ).toFixed(1);

  return {
    ...plan,
    city,
    cityName: lang === "ar" ? city.name_ar : city.name_en,
    hotel,
    activities,
    transport,
    tripReviews: allReviews,
    overallRating: Number(avgRating),
    totalReviews: hotel.reviewCount + activities.length * 12,
    criteria,
  };
}

export function saveLastSearch(criteria) {
  sessionStorage.setItem("travia_last_search", JSON.stringify(criteria));
}

export function loadLastSearch() {
  try {
    return JSON.parse(sessionStorage.getItem("travia_last_search") || "null");
  } catch {
    return null;
  }
}

export function saveGeneratedPlans(plans) {
  sessionStorage.setItem("travia_generated_plans", JSON.stringify(plans));
}

export function loadGeneratedPlans() {
  try {
    return JSON.parse(sessionStorage.getItem("travia_generated_plans") || "null");
  } catch {
    return null;
  }
}

export { stars };
