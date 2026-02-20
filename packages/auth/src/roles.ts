export const ROLES = ["buyer", "seller", "shg"] as const;
export type Role = (typeof ROLES)[number];
