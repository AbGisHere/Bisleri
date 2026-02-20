import { auth } from "@bisleri/auth";
import { type NextRequest, NextResponse } from "next/server";

const ROLE_PREFIXES = ["/buyer", "/seller", "/shg"] as const;
type Role = "buyer" | "seller" | "shg";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const session = await auth.api.getSession({
    headers: request.headers,
  });

  const user = session?.user;

  // Unauthenticated -> /login
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Not onboarded -> /onboarding
  if (!user.onboardingComplete) {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  // Role enforcement on role-prefixed routes
  const role = (user.role || "seller") as Role;
  for (const prefix of ROLE_PREFIXES) {
    if (pathname.startsWith(prefix) && !pathname.startsWith(`/${role}`)) {
      return NextResponse.redirect(
        new URL(`/${role}/dashboard`, request.url)
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/buyer/:path*", "/seller/:path*", "/shg/:path*", "/dashboard"],
};
