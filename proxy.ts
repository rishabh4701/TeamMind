// proxy.ts
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

/**
 * This runs for every request that matches the config below.
 * It checks for a valid NextAuth session before allowing access.
 */
export default async function proxy(request: Request) {
  const session = await auth();
  const { pathname } = new URL(request.url);

  // protect /dashboard and /team
  if (!session && ["/dashboard", "/team"].includes(pathname)) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // otherwise, allow through
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/team"],
};
