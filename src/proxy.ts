import { type NextRequest, NextResponse } from "next/server";
import envConfig from "./lib/config";
import { jwtUtils } from "./utils/jwt";

const protectedRoutes = [
  "/dashboard",
  "/profile",
  "/favorites",
  "/my-listings",
  "/admin",
  "/api/admin",
];

function isAdminRoute(pathname: string) {
  return (
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname === "/api/admin" ||
    pathname.startsWith("/api/admin/")
  );
}

function isApiRoute(pathname: string) {
  return pathname.startsWith("/api/");
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  const token = request.cookies.get("accessToken")?.value;

  if (!token) {
    if (isApiRoute(pathname)) {
      return NextResponse.json(
        { success: false, message: "Login is required" },
        { status: 401 },
      );
    }

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);

    return NextResponse.redirect(loginUrl);
  }

  try {
    const verified = jwtUtils.verifyToken(token, envConfig.jwt_access_secret);

    if (!verified.success) {
      const response = isApiRoute(pathname)
        ? NextResponse.json(
            { success: false, message: "Session expired" },
            { status: 401 },
          )
        : NextResponse.redirect(new URL("/login", request.url));

      response.cookies.delete("accessToken");

      return response;
    }

    const payload = verified.data as Record<string, unknown>;

    // Admin dashboard + admin APIs are reserved for admins only.
    if (isAdminRoute(pathname) && payload.role !== "ADMIN") {
      if (isApiRoute(pathname)) {
        return NextResponse.json(
          {
            success: false,
            message: "Forbidden: admin access required",
          },
          { status: 403 },
        );
      }

      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  } catch {
    const response = isApiRoute(pathname)
      ? NextResponse.json(
          { success: false, message: "Session expired" },
          { status: 401 },
        )
      : NextResponse.redirect(new URL("/login", request.url));

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
    "/api/admin/:path*",
  ],
};
