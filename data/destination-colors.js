/** لون مميز لكل محافظة — بدون صور من النت */

export const GOVERNORATE_COLORS = {
  cairo: { bg: "#C4A35A", accent: "#8B6914", label: "ذهبي حضري" },
  giza: { bg: "#D4A574", accent: "#9A6B3A", label: "رمال الأهرامات" },
  alexandria: { bg: "#2E86AB", accent: "#1A5276", label: "أزرق المتوسط" },
  dakahlia: { bg: "#52B788", accent: "#2D6A4F", label: "أخضر دلتا" },
  sharqia: { bg: "#74C69D", accent: "#40916C", label: "أخضر زراعي" },
  qalyubia: { bg: "#95D5B2", accent: "#52B788", label: "أخضر فاتح" },
  gharbia: { bg: "#B7E4C7", accent: "#52B788", label: "أخضر نعناعي" },
  monufia: { bg: "#A8DADC", accent: "#457B9D", label: "ترquoise هادئ" },
  beheira: { bg: "#4895EF", accent: "#1D3557", label: "أزرق بحري" },
  kafr_el_sheikh: { bg: "#4CC9F0", accent: "#0077B6", label: "أزرق سماوي" },
  damietta: { bg: "#5C80BC", accent: "#293241", label: "أزرق ميناء" },
  port_said: { bg: "#3A86FF", accent: "#023E8A", label: "أزرق ميناء" },
  ismailia: { bg: "#48CAE4", accent: "#0096C7", label: "أزرق قناة" },
  suez: { bg: "#0096C7", accent: "#03045E", label: "أزرق قناة" },
  fayoum: { bg: "#6A994E", accent: "#386641", label: "أخضر واحات" },
  beni_suef: { bg: "#BC6C25", accent: "#7F4F24", label: "بني صحراوي" },
  minya: { bg: "#E09F3E", accent: "#9A3412", label: "برتقالي صحراوي" },
  assiut: { bg: "#DDA15E", accent: "#BC6C25", label: "ذهبي صحراوي" },
  sohag: { bg: "#E76F51", accent: "#AE2012", label: "طوبي نوبي" },
  qena: { bg: "#F4A261", accent: "#E76F51", label: "برتقالي معابد" },
  luxor: { bg: "#E67E22", accent: "#A04000", label: "برتقالي معابد" },
  aswan: { bg: "#3498DB", accent: "#1A5276", label: "أزرق النيل" },
  red_sea: { bg: "#FF6B6B", accent: "#C0392B", label: "مرجاني" },
  new_valley: { bg: "#F1C40F", accent: "#B7950B", label: "ذهبي واحة" },
  matrouh: { bg: "#1ABC9C", accent: "#117A65", label: "ترquoise ساحلي" },
  north_sinai: { bg: "#E8C547", accent: "#9A7B0A", label: "ذهبي صحراوي" },
  south_sinai: { bg: "#40E0D0", accent: "#008B8B", label: "ترquoise البحر" },
};

const DEFAULT_COLOR = { bg: "#AE3115", accent: "#661000", label: "Travia" };

export function destinationColor(slug) {
  return GOVERNORATE_COLORS[slug] || DEFAULT_COLOR;
}

export function destinationGradient(slug) {
  const { bg, accent } = destinationColor(slug);
  return `linear-gradient(135deg, ${accent} 0%, ${bg} 55%, ${bg}dd 100%)`;
}
