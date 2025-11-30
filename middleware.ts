import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value; // Get token from cookies
  const { pathname } = req.nextUrl;
  // List of protected routes (including subroutes)
  const protectedRoutes = [
    "/dashboard",
    "/profile",
    "/settings",
    "/auth/set-pin",
  ];

  // Check if the request path starts with a protected route
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // If user is logged in and tries to access /login, redirect to /dashboard
  if (token && pathname === "/auth/login") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL("/auth/login", req.url)); // Redirect to login
  }

  return NextResponse.next(); // Continue if authenticated
}

// Apply middleware to all subroutes of protected paths
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/auth/set-pin",
    "/auth/login",
  ],
};
