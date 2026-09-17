import type { JwtPayload } from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import envConfig from "./lib/config";
import { jwtUtils } from "./utils/jwt";

const protectedRoutes = [
  "/dashboard",
  "/profile",
  "/favorites",
  "/my-listings",
  "/admin",
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedRoute = protectedRoutes.some(
    (route) =>
      pathname === route || pathname.startsWith(`${route}/`),
  );

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  const token = request.cookies.get("accessToken")?.value;

  const loginUrl = new URL("/login", request.url);
  if (!token) {

    loginUrl.searchParams.set("redirect", pathname);

    return NextResponse.redirect(loginUrl);
  }

  try {
    jwtUtils.verifyToken(token , envConfig.jwt_access_secret );
    return NextResponse.next();
  } catch {
    const loginUrl = new URL("/login", request.url);

    loginUrl.searchParams.set("redirect", pathname);

    const response = NextResponse.redirect(loginUrl);

    response.cookies.delete("accessToken");

    return response;
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/favorites/:path*",
    "/my-listings/:path*",
    "/admin/:path*",
  ],
};