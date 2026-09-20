import { NextResponse } from "next/server";

// ---------------------------------------------------------------------------
// POST /api/auth/logout
// ---------------------------------------------------------------------------
// Clears the session cookies (accessToken + the public auth_status marker).
// ---------------------------------------------------------------------------

export async function POST() {
  const response = NextResponse.json(
    {
      success: true,
      message: "Logged out successfully",
    },
    { status: 200 },
  );

  response.cookies.delete("accessToken");
  response.cookies.delete("auth_status");

  return response;
}
