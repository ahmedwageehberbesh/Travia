/** قوالب الرحلة — المستخدم يختار أكتر من واحد */

export const PLAN_TEMPLATES = [
  {
    id: "economy",
    i18n: "template.economy",
    name_ar: "اقتصادي",
    name_en: "Economy",
    hint_en: "Budget-smart: 3-star stay, shared transport, essential activities",
    hint_ar: "اقتصادي: إقامة 3 نجوم، مواصلات مشتركة، أنشطة أساسية",
  },
  {
    id: "balanced",
    i18n: "template.balanced",
    name_ar: "متوازن",
    name_en: "Balanced",
    hint_en: "Balanced: 4-star hotel, private transfers, curated mix",
    hint_ar: "متوازن: فندق 4 نجوم، نقل خاص، مزيج متنوع",
  },
  {
    id: "comfort",
    i18n: "template.comfort",
    name_ar: "فاخر",
    name_en: "Luxury",
    hint_en: "Luxury: 5-star resort, VIP transport, premium experiences",
    hint_ar: "فاخر: منتجع 5 نجوم، نقل VIP، تجارب premium",
  },
  {
    id: "family",
    i18n: "template.family",
    name_ar: "عائلي",
    name_en: "Family",
    hint_en: "Family: kid-friendly hotel, safe activities, flexible schedule",
    hint_ar: "عائلي: فندق مناسب للأطفال، أنشطة آمنة، جدول مرن",
  },
  {
    id: "adventure",
    i18n: "template.adventure",
    name_ar: "مغامرة",
    name_en: "Adventure",
    hint_en: "Adventure: outdoor focus, desert/sea sports, active days",
    hint_ar: "مغامرة: outdoor، رياضات بحر/صحراء، أيام نشطة",
  },
];

export const DEFAULT_TEMPLATE_IDS = ["economy", "balanced", "comfort"];

export function templateById(id) {
  return PLAN_TEMPLATES.find((t) => t.id === id);
}

export function templateHint(template, lang) {
  return lang === "ar" ? template.hint_ar : template.hint_en;
}

export function templateDisplayName(template, lang) {
  if (!template) return "";
  return lang === "ar" ? template.name_ar : template.name_en;
}
