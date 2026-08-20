import STRINGS_AR from "./ar.js";
import STRINGS_EN from "./en.js";

const PACKS = { ar: STRINGS_AR, en: STRINGS_EN };

let locale = localStorage.getItem("travia_locale") || "ar";
let strings = PACKS[locale] || STRINGS_AR;

function loadLocale(lang) {
  strings = PACKS[lang] || STRINGS_AR;
  locale = lang;
  localStorage.setItem("travia_locale", lang);
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  return strings;
}

function t(key) {
  return strings[key] || PACKS.ar[key] || key;
}

function setLocale(lang) {
  return loadLocale(lang);
}

export { t, setLocale, loadLocale, locale };
