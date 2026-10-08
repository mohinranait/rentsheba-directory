import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/utils/session";
import { ContactStatus } from "@generated/prisma/enums";

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "MANAGER")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || "";
    const statusParam = searchParams.get("status")?.trim().toUpperCase() || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.max(
      1,
      Math.min(100, parseInt(searchParams.get("pageSize") || "10", 10)),
    );

    const where: Record<string, unknown> = {};

    if (statusParam && statusParam !== "ALL") {
      if (Object.values(ContactStatus).includes(statusParam as ContactStatus)) {
        where.status = statusParam as ContactStatus;
      }
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { subject: { contains: search, mode: "insensitive" } },
        { message: { contains: search, mode: "insensitive" } },
      ];
    }

    const [total, items, statsGroup] = await Promise.all([
      prisma.contactMessage.count({ where }),
      prisma.contactMessage.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.contactMessage.groupBy({
        by: ["status"],
        _count: { _all: true },
      }),
    ]);

    const stats = {
      total: 0,
      unread: 0,
      read: 0,
      replied: 0,
      archived: 0,
    };

    for (const group of statsGroup) {
      stats.total += group._count._all;
      if (group.status === ContactStatus.UNREAD) {
        stats.unread = group._count._all;
      } else if (group.status === ContactStatus.READ) {
        stats.read = group._count._all;
      } else if (group.status === ContactStatus.REPLIED) {
        stats.replied = group._count._all;
      } else if (group.status === ContactStatus.ARCHIVED) {
        stats.archived = group._count._all;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        items,
        meta: {
          total,
          page,
          pageSize,
          totalPages: Math.max(1, Math.ceil(total / pageSize)),
        },
        stats,
      },
    });
  } catch (error) {
    console.error("Admin list contact messages error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
