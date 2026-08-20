/** Rich static demo content — works offline, no API. */
import { destinationBySlug, normalizeSlug } from "./destinations.js";

const TIER_STARS = { economy: 3, balanced: 4, comfort: 5 };

const CITY_HIGHLIGHTS = {
  cairo: {
    ar: "الأهرامات، المتحف المصري الكبير، وخان الخليلي",
    en: "Pyramids, Grand Egyptian Museum, and Khan El Khalili",
  },
  giza: {
    ar: "أهرامات الجيزة، أبو الهول، وممفيس",
    en: "Giza Pyramids, Sphinx, and Memphis",
  },
  alexandria: {
    ar: "قلعة قaitbay، مكتبة الإسكندرية، والكورniche",
    en: "Qaitbay Citadel, Bibliotheca Alexandrina, and Corniche",
  },
  dakahlia: {
    ar: "منصورة، نهر النيل، والدلta الخصبة",
    en: "Mansoura, Nile views, and fertile Delta",
  },
  sharqia: {
    ar: "الزقازيق، تل basta، ونهر baryus",
    en: "Zagazig, Tell Basta, and Baryus Nile",
  },
  qalyubia: {
    ar: "بنها، مدينة العبور، وقريب من القاهرة",
    en: "Benha, Obour City, near Cairo",
  },
  gharbia: {
    ar: "طنطا ومسجد السيد البadawi",
    en: "Tanta and El Badawi Mosque",
  },
  monufia: {
    ar: "شبين الكوم وريف الدلta",
    en: "Shibin El Kom and Delta countryside",
  },
  beheira: {
    ar: "رشid، نهر النيل، وبحيرة edku",
    en: "Rosetta, Nile, and Edku Lake",
  },
  kafr_el_sheikh: {
    ar: "بحيرة burullus وطبيعة الدلta",
    en: "Lake Burullus and Delta nature",
  },
  damietta: {
    ar: "ميناء دمياط، صناعة الأثاث، ونهر النيل",
    en: "Damietta port, furniture crafts, and Nile",
  },
  port_said: {
    ar: "فنar بورسعيد، قناة السuيس، والكورniche",
    en: "Port Said Lighthouse, Suez Canal, Corniche",
  },
  ismailia: {
    ar: "قناة السuيس، بحيرة التmsah، وحدائق",
    en: "Suez Canal, Lake Timsah, and gardens",
  },
  suez: {
    ar: "قناة السuيس، جبال عتاقة، وخليج السuيس",
    en: "Suez Canal, Ataka Mountains, Suez Gulf",
  },
  fayoum: {
    ar: "وادي الrayan، بحيرة قارun، ووادي الحيتان",
    en: "Wadi El Rayan, Lake Qarun, Whale Valley",
  },
  beni_suef: {
    ar: "نهر النيل، هرم مydum، والأديرة",
    en: "Nile, Meidum Pyramid, and monasteries",
  },
  minya: {
    ar: "Beni Hassan، تل العamarna، ونيل الmiddle",
    en: "Beni Hassan tombs, Amarna, and Nile cliffs",
  },
  assiut: {
    ar: "دير العذra، ونيل صعيد مصر",
    en: "Virgin Mary Monastery and Nile scenery",
  },
  sohag: {
    ar: "معبد أbydos، أخmin، ونيل الصعيد",
    en: "Abydos Temple, Akhmim, and upper Nile",
  },
  qena: {
    ar: "معبد dendera، قرب الأقصر، والنيل",
    en: "Dendera Temple, near Luxor, and Nile",
  },
  luxor: {
    ar: "Karnak، وادي الملوك، ومعبد hatshepsut",
    en: "Karnak, Valley of the Kings, Hatshepsut Temple",
  },
  aswan: {
    ar: "Philae، رحلات abu simbel، والقرى النubian",
    en: "Philae Temple, Abu Simbel trips, Nubian villages",
  },
  red_sea: {
    ar: "الغردقة، مرسى علم، غوص giftun، وأورنج bay",
    en: "Hurghada, Marsa Alam, Giftun diving, Orange Bay",
  },
  new_valley: {
    ar: "واحة سيوة، الصحراء البيضاء، والخarga",
    en: "Siwa Oasis, White Desert, and Kharga",
  },
  matrouh: {
    ar: "مرسى مطروh، سيوة، وشواطئ البحر المتوسط",
    en: "Marsa Matrouh, Siwa access, Mediterranean beaches",
  },
  north_sinai: {
    ar: "العريش، شواطئ البحر المتوسط",
    en: "El Arish and Mediterranean beaches",
  },
  south_sinai: {
    ar: "شرم الشيخ، دهب، رأس محمد، وسانت كاترين",
    en: "Sharm El Sheikh, Dahab, Ras Mohammed, St Catherine",
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
  const c = destinationBySlug(normalizeSlug(slug));
  if (!c) return slug;
  return lang === "ar" ? c.name_ar : c.name_en;
}

export function catalogSummary(citySlug, tier, tripTypes, lang) {
  const slug = normalizeSlug(citySlug);
  const name = cityName(slug, lang);
  const highlight = L(CITY_HIGHLIGHTS[slug] || { ar: name, en: name }, lang);
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
  const highlight = L(CITY_HIGHLIGHTS[normalizeSlug(citySlug)] || { ar: name, en: name }, lang);

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
