export const CATEGORIES = [
  "Weaving",
  "Pottery",
  "Embroidery",
  "Food",
  "Jewellery",
  "Painting",
  "Basket Weaving",
  "Tailoring",
] as const;

export type Category = (typeof CATEGORIES)[number];
