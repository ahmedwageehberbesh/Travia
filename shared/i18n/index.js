let locale = localStorage.getItem("travia_locale") || "ar";
let strings = {};

async function loadLocale(lang) {
  const res = await fetch(new URL(`./${lang}.json`, import.meta.url));
  strings = await res.json();
  locale = lang;
  localStorage.setItem("travia_locale", lang);
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
}

function t(key) {
  return strings[key] || key;
}

function setLocale(lang) {
  return loadLocale(lang);
}

export { t, setLocale, loadLocale, locale };
