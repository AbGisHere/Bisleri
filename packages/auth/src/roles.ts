export const ROLES = ["buyer", "seller", "ngo"] as const;
export type Role = (typeof ROLES)[number];
