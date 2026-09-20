import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/utils/session";
import { UserStatus } from "../../../../generated/prisma/enums";

// ---------------------------------------------------------------------------
// GET /api/me
// ---------------------------------------------------------------------------
// Returns the currently signed-in user (without password). Returns 401 without
// touching the database when there is no valid session, so the header can
// safely skip this call when the visitor is logged out.
// ---------------------------------------------------------------------------

export async function GET() {
  const session = await getSessionUser();

  if (!session?.userId) {
    return NextResponse.json(
      {
        success: false,
        message: "Not authenticated",
      },
      { status: 401 },
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        phone: true,
        role: true,
        status: true,
        isVerified: true,
        createdAt: true,
      },
    });

    if (
      !user ||
      user.status === UserStatus.BLOCKED ||
      user.status === UserStatus.DELETED
    ) {
      const response = NextResponse.json(
        {
          success: false,
          message: "Not authenticated",
        },
        { status: 401 },
      );

      response.cookies.delete("accessToken");
      response.cookies.delete("auth_status");

      return response;
    }

    return NextResponse.json({ success: true, user }, { status: 200 });
  } catch (error) {
    console.error("Get me error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch my information",
      },
      { status: 500 },
    );
  }
}
