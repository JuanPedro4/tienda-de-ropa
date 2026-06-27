import { auth } from "@/lib/auth/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Role-based route protection middleware.
 *
 * Public routes:  /*                (no auth required)
 * Protected:      /cuenta/*         (requires CUSTOMER, ADMIN, or SUPER_ADMIN)
 * Admin only:     /admin/*          (requires ADMIN or SUPER_ADMIN)
 */
export default auth((req: NextRequest & { auth?: unknown }) => {
  const { pathname } = req.nextUrl;
  const session = req.auth as {
    user?: { role: string };
  } | null;

  // Public routes — allow all
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/images") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // Admin routes — require ADMIN or SUPER_ADMIN
  if (pathname.startsWith("/admin")) {
    if (!session?.user) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    const role = session.user.role;
    if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/?error=unauthorized", req.url));
    }
    return NextResponse.next();
  }

  // Account routes — require any authenticated user
  if (pathname.startsWith("/cuenta")) {
    if (!session?.user) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Match all routes except static files
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
