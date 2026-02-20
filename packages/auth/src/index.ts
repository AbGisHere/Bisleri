import { db } from "@bisleri/db";
import * as schema from "@bisleri/db/schema/auth";
import { env } from "@bisleri/env/server";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";

export { ROLES, type Role } from "./roles";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",

    schema: schema,
  }),
  trustedOrigins: [env.CORS_ORIGIN, "http://localhost:3000"],
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      // Auth fields
      role: {
        type: "string",
        required: false,
        defaultValue: "seller",
        input: false,
      },
      onboardingComplete: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: false,
      },

      // Profile fields
      age: {
        type: "number",
        required: false,
      },
      location: {
        type: "string",
        required: false,
      },
      skills: {
        type: "string",
        required: false,
      },
    },
  },
  plugins: [nextCookies()],
});
