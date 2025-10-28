import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("icas_auth")?.value;

  // If no token, redirect to login
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Fetch user info from backend
  const res = await fetch("http://localhost:5275/api/Auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const me = await res.json();

  // Your backend returns roles array
  const roles: string[] = me.roles || [];

  const path = req.nextUrl.pathname;

  console.log("[Middleware] User payload:", me);

  // --- Protect /admin routes ---
  if (path.startsWith("/admin")) {
    if (!roles.includes("Super Admin") && !roles.includes("IT Admin")) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  }

  // --- Protect /staff routes ---
  if (path.startsWith("/staff")) {
    if (!roles.includes("Super Admin") &&
        !roles.includes("Admin") &&
        !roles.includes("Standard User")) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  }

  return NextResponse.next();
}

// Apply middleware only to these routes
export const config = {
  matcher: ["/admin/:path*", "/staff/:path*"],
};
