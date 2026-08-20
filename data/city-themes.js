/** ألوان كل محافظة — تتطبق على الواجهة عند الاختيار */

const DEFAULT = {
  primary: "#ae3115",
  onPrimary: "#ffffff",
  primaryContainer: "#ff6b4a",
  secondary: "#7e5700",
  secondaryContainer: "#ffc96f",
  surface: "#fff8f6",
  overlay: "rgba(14, 116, 144, 0.35)",
};

export const GOVERNORATE_THEMES = {
  south_sinai: {
    primary: "#0e7490",
    onPrimary: "#ffffff",
    primaryContainer: "#22d3ee",
    secondary: "#ca8a04",
    secondaryContainer: "#fde047",
    surface: "#f0f9ff",
    overlay: "rgba(14, 116, 144, 0.42)",
  },
  red_sea: {
    primary: "#0369a1",
    onPrimary: "#ffffff",
    primaryContainer: "#38bdf8",
    secondary: "#ea580c",
    secondaryContainer: "#fdba74",
    surface: "#f0f9ff",
    overlay: "rgba(3, 105, 161, 0.4)",
  },
  cairo: {
    primary: "#b45309",
    onPrimary: "#ffffff",
    primaryContainer: "#fbbf24",
    secondary: "#78716c",
    secondaryContainer: "#d6d3d1",
    surface: "#fffbeb",
    overlay: "rgba(180, 83, 9, 0.38)",
  },
  giza: {
    primary: "#a16207",
    onPrimary: "#ffffff",
    primaryContainer: "#fcd34d",
    secondary: "#57534e",
    secondaryContainer: "#e7e5e4",
    surface: "#fffbeb",
    overlay: "rgba(161, 98, 7, 0.4)",
  },
  alexandria: {
    primary: "#1d4ed8",
    onPrimary: "#ffffff",
    primaryContainer: "#60a5fa",
    secondary: "#64748b",
    secondaryContainer: "#cbd5e1",
    surface: "#eff6ff",
    overlay: "rgba(29, 78, 216, 0.38)",
  },
  luxor: {
    primary: "#c2410c",
    onPrimary: "#ffffff",
    primaryContainer: "#fb923c",
    secondary: "#a16207",
    secondaryContainer: "#fcd34d",
    surface: "#fff7ed",
    overlay: "rgba(194, 65, 12, 0.4)",
  },
  aswan: {
    primary: "#0f766e",
    onPrimary: "#ffffff",
    primaryContainer: "#2dd4bf",
    secondary: "#b45309",
    secondaryContainer: "#fcd34d",
    surface: "#f0fdfa",
    overlay: "rgba(15, 118, 110, 0.38)",
  },
  matrouh: {
    primary: "#0284c7",
    onPrimary: "#ffffff",
    primaryContainer: "#7dd3fc",
    secondary: "#f59e0b",
    secondaryContainer: "#fde68a",
    surface: "#f0f9ff",
    overlay: "rgba(2, 132, 199, 0.35)",
  },
  new_valley: {
    primary: "#15803d",
    onPrimary: "#ffffff",
    primaryContainer: "#4ade80",
    secondary: "#ca8a04",
    secondaryContainer: "#fde047",
    surface: "#f0fdf4",
    overlay: "rgba(21, 128, 61, 0.35)",
  },
  fayoum: {
    primary: "#0891b2",
    onPrimary: "#ffffff",
    primaryContainer: "#67e8f9",
    secondary: "#65a30d",
    secondaryContainer: "#bef264",
    surface: "#ecfeff",
    overlay: "rgba(8, 145, 178, 0.38)",
  },
  north_sinai: {
    primary: "#2563eb",
    onPrimary: "#ffffff",
    primaryContainer: "#93c5fd",
    secondary: "#d97706",
    secondaryContainer: "#fcd34d",
    surface: "#eff6ff",
    overlay: "rgba(37, 99, 235, 0.35)",
  },
};

export function themeForGovernorate(slug) {
  return GOVERNORATE_THEMES[slug] || DEFAULT;
}

export function applyGovernorateTheme(slug) {
  const t = themeForGovernorate(slug);
  const root = document.documentElement;
  root.style.setProperty("--color-primary", t.primary);
  root.style.setProperty("--color-on-primary", t.onPrimary);
  root.style.setProperty("--color-primary-container", t.primaryContainer);
  root.style.setProperty("--color-secondary", t.secondary);
  root.style.setProperty("--color-secondary-container", t.secondaryContainer);
  root.style.setProperty("--color-bg", t.surface);
  root.style.setProperty("--color-surface", t.surface);
  root.style.setProperty("--hero-overlay-tint", t.overlay);
  root.dataset.cityTheme = slug;
}
