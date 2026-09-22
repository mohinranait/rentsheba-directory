import bcrypt from "bcryptjs";
import { type NextRequest, NextResponse } from "next/server";
import config from "@/lib/config";
import { prisma } from "@/lib/prisma";
import { adminUserFormSchema } from "@/lib/schemas/admin-user-schema";
import { uploadToCloudinary } from "@/utils/upload-image";
import { UserRole, UserStatus } from "../../../../../generated/prisma/enums";
import type { AdminUserListItem, AdminUserListResponse } from "./types";

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

const ROLES = Object.values(UserRole) as string[];
const STATUSES = Object.values(UserStatus) as string[];

type GroupedCount = {
  status: string;
  _count: { _all: number };
};

// ---------------------------------------------------------------------------
// GET /api/admin/users
// ---------------------------------------------------------------------------
// Manageable user table endpoint with search, role + status filters and
// server-side pagination. Never returns password hashes.
//
// Query params:
//   search    Partial match on name, email or phone
//   role      UserRole (USER | MANAGER | ADMIN) or empty / "all"
//   status    UserStatus (ACTIVE | BLOCKED | DELETED) or empty / "all"
//   page      1-based page number (default: 1)
//   pageSize  Rows per page (default: 10, max: 100)
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const pageSize = Math.min(
      MAX_PAGE_SIZE,
      Math.max(1, Number(searchParams.get("pageSize") ?? DEFAULT_PAGE_SIZE)),
    );

    const search = searchParams.get("search")?.trim() ?? "";
    const role = searchParams.get("role") ?? "";
    const status = searchParams.get("status") ?? "";

    const where = {
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              { email: { contains: search, mode: "insensitive" as const } },
              { phone: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
      ...(role && ROLES.includes(role) ? { role: role as UserRole } : {}),
      ...(status && STATUSES.includes(status)
        ? { status: status as UserStatus }
        : {}),
    };

    const [total, items, counts, adminCount] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          image: true,
          role: true,
          status: true,
          isVerified: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: { listings: true, favorites: true, subscriptions: true },
          },
        },
      }),
      prisma.user.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.user.count({ where: { role: UserRole.ADMIN } }),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    const response: AdminUserListResponse = {
      success: true,
      data: {
        items: items as AdminUserListItem[],
        meta: { total, page, pageSize, totalPages },
        stats: buildStats(counts as unknown as GroupedCount[], adminCount),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Get admin users error:", error);

    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 },
    );
  }
}

function buildStats(counts: GroupedCount[], adminCount: number) {
  const byStatus = new Map<string, number>();

  for (const row of counts) {
    byStatus.set(row.status, row._count._all);
  }

  return {
    total: counts.reduce((sum, row) => sum + row._count._all, 0),
    active: byStatus.get(UserStatus.ACTIVE) ?? 0,
    blocked: byStatus.get(UserStatus.BLOCKED) ?? 0,
    admins: adminCount,
  };
}

// ---------------------------------------------------------------------------
// POST /api/admin/users
// ---------------------------------------------------------------------------
// Creates a user from the admin panel (name, email, password, optional phone /
// role / status / verified flag + optional profile image). The password is
// always hashed before it is stored.
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const name = String(formData.get("name") ?? "");
    const email = String(formData.get("email") ?? "");
    const phone = String(formData.get("phone") ?? "");
    const role = String(formData.get("role") ?? UserRole.USER);
    const status = String(formData.get("status") ?? UserStatus.ACTIVE);
    const isVerified = formData.get("isVerified") === "true";
    const password = String(formData.get("password") ?? "");
    const image = formData.get("image");

    const parsed = adminUserFormSchema.safeParse({
      name,
      email,
      phone,
      role,
      status,
      isVerified,
      password,
    });

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    if (!password) {
      return NextResponse.json(
        { success: false, message: "A password is required" },
        { status: 400 },
      );
    }

    const data = parsed.data;

    const existing = await prisma.user.findUnique({
      where: { email: data.email },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: "A user with this email already exists" },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(
      password,
      Number(config.bcrypt_salt_rounds),
    );

    let imageUrl: string | null = null;

    if (image instanceof File) {
      const { secure_url } = await uploadToCloudinary(image);
      imageUrl = secure_url;
    }

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        phone: data.phone?.trim() || null,
        role: data.role,
        status: data.status,
        isVerified: data.isVerified ?? false,
        image: imageUrl,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
        role: true,
        status: true,
        isVerified: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "User created successfully",
        data: user,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create admin user error:", error);

    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 },
    );
  }
}
