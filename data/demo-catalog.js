/** Rich static demo content — works offline, no API. */
import { destinationBySlug } from "./destinations.js";

const TIER_STARS = { economy: 3, balanced: 4, comfort: 5 };

const CITY_HIGHLIGHTS = {
  sharm_el_sheikh: {
    ar: "خليج نعمة، رأس محمد، وشواطئ المرجان",
    en: "Naama Bay, Ras Mohammed, and coral beaches",
  },
  hurghada: {
    ar: "مارينا الغردقة، جزيرة أورنج باي، وغوص Giftun",
    en: "Hurghada Marina, Orange Bay, and Giftun diving",
  },
  marsa_alam: {
    ar: "Dolphin House، شاطئ أبو دباب، ومحمية وادي الجمال",
    en: "Dolphin House, Abu Dabbab beach, Wadi El Gemal",
  },
  dahab: {
    ar: "البلو هول، اللاجون، وجبال سيناء",
    en: "Blue Hole, the Lagoon, and Sinai mountains",
  },
  cairo: {
    ar: "الأهرامات، المتحف المصري، وخان الخليلي",
    en: "Pyramids, Egyptian Museum, and Khan El Khalili",
  },
  luxor: {
    ar: "معبد الكarnak، وادي الملوك، ونيل الأقصر",
    en: "Karnak Temple, Valley of the Kings, Luxor Nile",
  },
  aswan: {
    ar: "معبد فيلة، جزيرة النباتات، ونوبة أسوان",
    en: "Philae Temple, Botanical Island, Nubian Aswan",
  },
  alexandria: {
    ar: "Qaitbay Citadel، مكتبة الإسكندرية، وكورniche",
    en: "Qaitbay Citadel, Bibliotheca, and Corniche",
  },
  siwa: {
    ar: "واحة سيوة، جبل الموتى، وحمامات الكبريت",
    en: "Siwa Oasis, Mountain of the Dead, salt lakes",
  },
};

const ACTIVITY_CATALOG = {
  SEA: {
    ar: {
      name: "رحلة غوص و snorkeling",
      desc: "رحلة قارب مع مرشد، معدات كاملة، ووقفة snorkeling في أجمل الشعب المرجانية.",
      duration: "4 ساعات",
    },
    en: {
      name: "Snorkeling & diving trip",
      desc: "Boat trip with guide, full gear, and snorkeling at the best reef spots.",
      duration: "4 hours",
    },
  },
  RELAXATION: {
    ar: {
      name: "Spa واسترخاء",
      desc: "مساج 60 دقيقة، Jacuzzi، ومنطقة استرخاء بإطلالة.",
      duration: "2 ساعة",
    },
    en: {
      name: "Spa & relaxation",
      desc: "60-min massage, jacuzzi, and lounge with a view.",
      duration: "2 hours",
    },
  },
  ADVENTURE: {
    ar: {
      name: "سفاري صحراوية",
      desc: "جولة 4x4، عشاء بدوي، وعروض فولكلورية.",
      duration: "6 ساعات",
    },
    en: {
      name: "Desert safari",
      desc: "4x4 dunes tour, Bedouin dinner, and folk show.",
      duration: "6 hours",
    },
  },
  HERITAGE: {
    ar: {
      name: "جولة آثار",
      desc: "زيارة معالم أثرية مع مرشد مرخص وتذاكر دخول.",
      duration: "5 ساعات",
    },
    en: {
      name: "Heritage tour",
      desc: "Licensed guide tour of major heritage sites with entry tickets.",
      duration: "5 hours",
    },
  },
  HONEYMOON: {
    ar: {
      name: "عشاء رومانسي",
      desc: "عشاء خاص على البحر مع موسيقى هادئة.",
      duration: "3 ساعات",
    },
    en: {
      name: "Romantic dinner",
      desc: "Private seaside dinner with live soft music.",
      duration: "3 hours",
    },
  },
};

const TIER_LABEL = {
  economy: { ar: "اقتصادي", en: "Economy" },
  balanced: { ar: "متوازن", en: "Balanced" },
  comfort: { ar: "فاخر", en: "Luxury" },
};

function L(obj, lang) {
  return obj[lang] || obj.ar || obj.en || "";
}

function cityName(slug, lang) {
  const c = destinationBySlug(slug);
  if (!c) return slug;
  return lang === "ar" ? c.name_ar : c.name_en;
}

export function catalogSummary(citySlug, tier, tripTypes, lang) {
  const name = cityName(citySlug, lang);
  const highlight = L(CITY_HIGHLIGHTS[citySlug] || { ar: name, en: name }, lang);
  const tierLbl = L(TIER_LABEL[tier], lang);
  if (lang === "ar") {
    return `باقة ${tierLbl} في ${name} — ${highlight}.`;
  }
  return `${tierLbl} package in ${name} — ${highlight}.`;
}

export function catalogHotel(citySlug, tier, lang) {
  const name = cityName(citySlug, lang);
  const stars = TIER_STARS[tier];
  const tierLbl = L(TIER_LABEL[tier], lang);
  const highlight = L(CITY_HIGHLIGHTS[citySlug] || { ar: name, en: name }, lang);

  return {
    name:
      lang === "ar"
        ? `فندق ${name} ${stars} نجوم`
        : `${name} ${stars}-Star Hotel`,
    description:
      lang === "ar"
        ? `فندق ${tierLbl} في ${name}. ${highlight}. إفطار مشمول وواي فاي مجاني.`
        : `${tierLbl} hotel in ${name}. ${highlight}. Breakfast and WiFi included.`,
    amenities:
      lang === "ar"
        ? ["واي فاي", "مسبح", "إفطار", "تكييف", ...(tier !== "economy" ? ["شاطئ", "خدمة غرف"] : [])]
        : ["WiFi", "Pool", "Breakfast", "A/C", ...(tier !== "economy" ? ["Beach", "Room service"] : [])],
  };
}

export function catalogActivityLabels(citySlug, tripTypes, lang) {
  const primary = tripTypes[0] || "SEA";
  const act = ACTIVITY_CATALOG[primary] || ACTIVITY_CATALOG.SEA;
  const name = cityName(citySlug, lang);
  return {
    primary: L(act, lang).name || act.ar.name,
    primaryDesc: L(act, lang).desc,
    primaryDuration: L(act, lang).duration,
    extra:
      lang === "ar"
        ? { name: `جولة ${name}`, desc: `جولة مرشدة في أهم معالم ${name}.`, duration: "3 ساعات" }
        : { name: `${name} tour`, desc: `Guided highlights tour of ${name}.`, duration: "3 hours" },
  };
}

export function catalogTransport(citySlug, tier, lang) {
  const comfort = tier === "comfort";
  return {
    name: lang === "ar" ? "نقل المطار" : "Airport transfer",
    description:
      lang === "ar"
        ? comfort
          ? `سيارة خاصة مكيفة — ${cityName(citySlug, lang)}`
          : `أتوبيس مشترك مكيف — ${cityName(citySlug, lang)}`
        : comfort
          ? `Private A/C car — ${cityName(citySlug, lang)}`
          : `Shared A/C bus — ${cityName(citySlug, lang)}`,
  };
}

export function catalogPlanItems(citySlug, tier, tripTypes, lang) {
  const hotel = catalogHotel(citySlug, tier, lang);
  const transport = catalogTransport(citySlug, tier, lang);
  const acts = catalogActivityLabels(citySlug, tripTypes, lang);
  return {
    hotel: hotel.name,
    transport: transport.name,
    activity: acts.primary,
  };
}

export const DEMO_REVIEWS = {
  ar: [
    { name: "سارة محمود", text: "تجربة ممتازة! الفندق نظيف والأنشطة منظمة.", rating: 5 },
    { name: "أحمد حسن", text: "قيمة مقابل سعر رائعة. النقل في الموعد.", rating: 4 },
    { name: "نور الدين", text: "رحلة العائلة كانت ممتعة جداً.", rating: 5 },
    { name: "مريم علي", text: "خدمة جيدة وأنصح بها.", rating: 4 },
    { name: "كريم فتحي", text: "إطلالة رائعة وإفطار متنوع.", rating: 5 },
  ],
  en: [
    { name: "Sarah M.", text: "Excellent! Clean hotel and well-organized activities.", rating: 5 },
    { name: "Ahmed H.", text: "Great value. Transfer was on time.", rating: 4 },
    { name: "Nour E.", text: "Family trip was very fun.", rating: 5 },
    { name: "Mariam A.", text: "Good service, recommended.", rating: 4 },
    { name: "Karim F.", text: "Amazing views and varied breakfast.", rating: 5 },
  ],
};
