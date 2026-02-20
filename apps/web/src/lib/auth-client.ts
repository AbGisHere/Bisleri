import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [
    inferAdditionalFields({
      user: {
        role: { type: "string", required: false },
        age: { type: "number", required: false },
        location: { type: "string", required: false },
        skills: { type: "string", required: false },
        onboardingComplete: { type: "boolean", required: false },
      },
    }),
  ],
});
