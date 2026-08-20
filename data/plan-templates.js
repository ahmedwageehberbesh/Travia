/** قوالب الرحلة — المستخدم يختار أكتر من واحد */

export const PLAN_TEMPLATES = [
  {
    id: "economy",
    i18n: "template.economy",
    hint_en: "Budget-smart: 3-star stay, shared transport, essential activities",
    hint_ar: "اقتصادي: إقامة 3 نجوم، مواصلات مشتركة، أنشطة أساسية",
  },
  {
    id: "balanced",
    i18n: "template.balanced",
    hint_en: "Balanced: 4-star hotel, private transfers, curated mix",
    hint_ar: "متوازن: فندق 4 نجوم، نقل خاص، مزيج متنوع",
  },
  {
    id: "comfort",
    i18n: "template.comfort",
    hint_en: "Luxury: 5-star resort, VIP transport, premium experiences",
    hint_ar: "فاخر: منتجع 5 نجوم، نقل VIP، تجارب premium",
  },
  {
    id: "family",
    i18n: "template.family",
    hint_en: "Family: kid-friendly hotel, safe activities, flexible schedule",
    hint_ar: "عائلي: فندق مناسب للأطفال، أنشطة آمنة، جدول مرن",
  },
  {
    id: "adventure",
    i18n: "template.adventure",
    hint_en: "Adventure: outdoor focus, desert/sea sports, active days",
    hint_ar: "مغامرة: تركيز outdoor، رياضات بحر/صحراء، أيام نشطة",
  },
];

export const DEFAULT_TEMPLATE_IDS = ["economy", "balanced", "comfort"];

export function templateById(id) {
  return PLAN_TEMPLATES.find((t) => t.id === id);
}

export function templateHint(template, lang) {
  return lang === "ar" ? template.hint_ar : template.hint_en;
}
