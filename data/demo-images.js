/** Travel photos — Wikimedia Commons + Unsplash (Egypt landmarks per governorate). */

function unsplash(id, w = 1200) {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;
}

function wiki(filePath, w = 1920) {
  const fileName = filePath.split("/").pop();
  return `https://upload.wikimedia.org/wikipedia/commons/thumb/${filePath}/${w}px-${fileName}`;
}

export function thumb(src, w = 120) {
  if (src.includes("unsplash.com")) {
    return src.replace(/w=\d+/, `w=${w}`);
  }
  return src.replace(/\/\d+px-/, `/${w}px-`);
}

/** Unsplash-first — أضمن للعرض (Wikimedia أحياناً يفشل hotlink) */
export const GOVERNORATE_HERO = {
  cairo: unsplash("1572252002811-b253801674ce", 1920),
  giza: unsplash("1572252002811-b253801674ce", 1920),
  alexandria: unsplash("1569163139599-0b0bc06e2e0c", 1920),
  dakahlia: unsplash("1544735719646-4a1934568998", 1920),
  red_sea: unsplash("1544551763-77ef2d0cfc6c", 1920),
  beheira: unsplash("1501785888941-47e902277b93", 1920),
  gharbia: unsplash("1501785888941-47e902277b93", 1920),
  monufia: unsplash("1501785888941-47e902277b93", 1920),
  qalyubia: unsplash("1469858528030-a6985d3a94b1", 1920),
  sharqia: unsplash("1469858528030-a6985d3a94b1", 1920),
  kafr_el_sheikh: unsplash("1544735719646-4a1934568998", 1920),
  damietta: unsplash("1544627867-9f4c8a8694e8", 1920),
  port_said: unsplash("1544627867-9f4c8a8694e8", 1920),
  ismailia: unsplash("1544627867-9f4c8a8694e8", 1920),
  suez: unsplash("1544627867-9f4c8a8694e8", 1920),
  north_sinai: unsplash("1507525428034-b723cf961d3e", 1920),
  south_sinai: unsplash("1580831388967-965a807c5b57", 1920),
  fayoum: unsplash("1509316785289-025f5b846b8f", 1920),
  beni_suef: unsplash("1613395877788-f243461148bb", 1920),
  minya: unsplash("1568320561449-1f775838d0f7", 1920),
  assiut: unsplash("1613395877788-f243461148bb", 1920),
  new_valley: unsplash("1509316785289-025f5b846b8f", 1920),
  matrouh: unsplash("1507525428034-b723cf961d3e", 1920),
  luxor: unsplash("1568320561449-1f775838d0f7", 1920),
  qena: unsplash("1568320561449-1f775838d0f7", 1920),
  sohag: unsplash("1568320561449-1f775838d0f7", 1920),
  aswan: unsplash("1613395877788-f243461148bb", 1920),
};

/* Wikimedia as optional upgrade when available */
export const GOVERNORATE_HERO_HD = {
  cairo: wiki("a/af/All_Gizah_Pyramids.jpg"),
  giza: wiki("2/2c/Kheops-Pyramid.jpg"),
  alexandria: wiki("1/1e/Qaitbay_Citadel%2C_Alexandria.jpg"),
  red_sea: wiki("4/4e/Hurghada_Marina.jpg"),
  south_sinai: wiki("e/e8/Naama_Bay%2C_Sharm_el-Sheikh.jpg"),
  luxor: wiki("6/6e/Karnak_Temple_Ruins%2C_Luxor%2C_Egypt.jpg"),
  aswan: wiki("8/8a/Aswan_Egypt_Nile_River.jpg"),
  new_valley: wiki("5/5e/Siwa_Oasis%2C_Egypt.jpg"),
};

export const GOVERNORATE_HERO_FALLBACK = {
  cairo: unsplash("1572252002811-b253801674ce", 1920),
  giza: unsplash("1572252002811-b253801674ce", 1920),
  alexandria: unsplash("1569163139599-0b0bc06e2e0c", 1920),
  dakahlia: unsplash("1469858528030-a6985d3a94b1", 1920),
  red_sea: unsplash("1544551763-77ef2d0cfc6c", 1920),
  beheira: unsplash("1501785888941-47e902277b93", 1920),
  gharbia: unsplash("1501785888941-47e902277b93", 1920),
  monufia: unsplash("1501785888941-47e902277b93", 1920),
  qalyubia: unsplash("1469858528030-a6985d3a94b1", 1920),
  sharqia: unsplash("1469858528030-a6985d3a94b1", 1920),
  kafr_el_sheikh: unsplash("1544735719646-4a1934568998", 1920),
  damietta: unsplash("1544627867-9f4c8a8694e8", 1920),
  port_said: unsplash("1544627867-9f4c8a8694e8", 1920),
  ismailia: unsplash("1544627867-9f4c8a8694e8", 1920),
  suez: unsplash("1544627867-9f4c8a8694e8", 1920),
  north_sinai: unsplash("1507525428034-b723cf961d3e", 1920),
  south_sinai: unsplash("1580831388967-965a807c5b57", 1920),
  fayoum: unsplash("1509316785289-025f5b846b8f", 1920),
  beni_suef: unsplash("1613395877788-f243461148bb", 1920),
  minya: unsplash("1568320561449-1f775838d0f7", 1920),
  assiut: unsplash("1613395877788-f243461148bb", 1920),
  new_valley: unsplash("1509316785289-025f5b846b8f", 1920),
  matrouh: unsplash("1507525428034-b723cf961d3e", 1920),
  luxor: unsplash("1568320561449-1f775838d0f7", 1920),
  qena: unsplash("1568320561449-1f775838d0f7", 1920),
  sohag: unsplash("1568320561449-1f775838d0f7", 1920),
  aswan: unsplash("1613395877788-f243461148bb", 1920),
};

/** @deprecated use GOVERNORATE_HERO — kept for imports */
export const CITY_HERO = GOVERNORATE_HERO;
export const CITY_HERO_FALLBACK = GOVERNORATE_HERO_FALLBACK;

export function cityHeroUrl(slug) {
  return (
    GOVERNORATE_HERO_HD[slug] ||
    GOVERNORATE_HERO[slug] ||
    GOVERNORATE_HERO_FALLBACK[slug] ||
    unsplash("1501785888941-47e902277b93", 1920)
  );
}

/* ── Hotel gallery by tier ── */
export const HOTEL_IMAGES = {
  economy: [
    { src: unsplash("1590490360182-c33d57733427"), captionKey: "plan.img_room" },
    { src: unsplash("1566665797727-4b87c3a02176"), captionKey: "plan.img_pool" },
    { src: unsplash("1582719478250-c89cae4dc85b"), captionKey: "plan.img_view" },
  ],
  balanced: [
    { src: unsplash("1571896349842-33c89424de2d"), captionKey: "plan.img_room" },
    { src: unsplash("1520250497591-112f2f40a3f4"), captionKey: "plan.img_pool" },
    { src: unsplash("1566073771259-6a8506099945"), captionKey: "plan.img_view" },
    { src: unsplash("1414235077428-338989a2e8c0"), captionKey: "plan.img_dining" },
  ],
  comfort: [
    { src: unsplash("1631049307264-da0ec9d70304"), captionKey: "plan.img_room" },
    { src: unsplash("1582719508461-905cc78a725e"), captionKey: "plan.img_pool" },
    { src: unsplash("1578683010236-d716b9a0795b"), captionKey: "plan.img_view" },
    { src: unsplash("1551882547-ff40c63fe5fa"), captionKey: "plan.img_dining" },
  ],
};

export const ACTIVITY_IMAGES = {
  SEA: [
    unsplash("1559827260-dc66d52bef19"),
    unsplash("1583212292626-8677eb273e39"),
  ],
  RELAXATION: [
    unsplash("1540555700478-4be289fbecef"),
    unsplash("1600334089648-b0c9f7a3c6a8"),
  ],
  ADVENTURE: [
    unsplash("1509316785289-025f5b846b8f"),
    unsplash("1451339816644-54788312fedd"),
  ],
  HERITAGE: [
    wiki("6/6e/Karnak_Temple_Ruins%2C_Luxor%2C_Egypt.jpg", 900),
    wiki("a/af/All_Gizah_Pyramids.jpg", 900),
  ],
  HONEYMOON: [
    unsplash("1567899378494-47b059425544"),
    unsplash("1519046904884-53103b34b206"),
  ],
  CITY_TOUR: [
    unsplash("1469858528030-a6985d3a94b1"),
    wiki("a/af/All_Gizah_Pyramids.jpg", 900),
  ],
};

export const TRANSPORT_IMAGE = unsplash("1544627867-9f4c8a8694e8");

export function tripTypeImage(type) {
  const urls = ACTIVITY_IMAGES[type] || ACTIVITY_IMAGES.SEA;
  return thumb(urls[0], 320);
}

export function preloadImageWithFallback(primary, fallback) {
  const img = new Image();
  img.src = primary;
  if (fallback && fallback !== primary) {
    const fb = new Image();
    fb.src = fallback;
  }
}

export function imgOnError(el, fallback) {
  if (fallback && el.src !== fallback) el.src = fallback;
}
