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
        interests: { type: "string", required: false },
        onboardingComplete: { type: "boolean", required: false },
        shgName: { type: "string", required: false },
        memberCount: { type: "number", required: false },
        focusArea: { type: "string", required: false },
        districtCoverage: { type: "string", required: false },
      },
    }),
  ],
});
