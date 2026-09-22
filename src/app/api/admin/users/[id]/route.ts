import bcrypt from "bcryptjs";
import { type NextRequest, NextResponse } from "next/server";
import config from "@/lib/config";
import { prisma } from "@/lib/prisma";
import { adminUserFormSchema } from "@/lib/schemas/admin-user-schema";
import { uploadToCloudinary } from "@/utils/upload-image";
import { UserRole, UserStatus } from "../../../../../../generated/prisma/enums";
import type { AdminUserDetailResponse } from "../types";

const ROLES = Object.values(UserRole) as string[];
const STATUSES = Object.values(UserStatus) as string[];

type RouteContext = {
  params: Promise<{ id: string }>;
};

const userSelect = {
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
} as const;

// ---------------------------------------------------------------------------
// GET /api/admin/users/[id]
// ---------------------------------------------------------------------------
// Single user detail for the edit / view pages, including a few recent
// listings and subscriptions so the admin gets quick context.
// ---------------------------------------------------------------------------

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        ...userSelect,
        _count: {
          select: { listings: true, favorites: true, subscriptions: true },
        },
        listings: {
          orderBy: { createdAt: "desc" },
          take: 10,
          select: {
            id: true,
            title: true,
            slug: true,
            verificationStatus: true,
          },
        },
        subscriptions: {
          orderBy: { createdAt: "desc" },
          take: 10,
          select: {
            id: true,
            status: true,
            startsAt: true,
            expiresAt: true,
            plan: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    const response: AdminUserDetailResponse = { success: true, data: user };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Get admin user error:", error);

    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// PATCH /api/admin/users/[id]
// ---------------------------------------------------------------------------
// Two modes:
//  • JSON body            → quick actions (change role / status / verify).
//  • multipart/form-data  → the full edit form (info + optional new password
//                           and profile image). Blank password = keep current.
// ---------------------------------------------------------------------------

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const existing = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    const contentType = request.headers.get("content-type") ?? "";

    if (contentType.includes("multipart/form-data")) {
      return handleFullUpdate(request, id, existing.email);
    }

    return handleQuickUpdate(await request.json(), id);
  } catch (error) {
    console.error("Update admin user error:", error);

    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// PATCH — quick actions (role / status / verified)
// ---------------------------------------------------------------------------

async function handleQuickUpdate(body: Record<string, unknown>, id: string) {
  const role = typeof body.role === "string" ? body.role : "";
  const status = typeof body.status === "string" ? body.status : "";
  const isVerified =
    typeof body.isVerified === "boolean" ? body.isVerified : null;

  const data: { role?: UserRole; status?: UserStatus; isVerified?: boolean } =
    {};

  if (role && ROLES.includes(role)) {
    data.role = role as UserRole;
  }

  if (status && STATUSES.includes(status)) {
    data.status = status as UserStatus;
  }

  if (isVerified !== null) {
    data.isVerified = isVerified;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json(
      { success: false, message: "Nothing to update" },
      { status: 400 },
    );
  }

  const updated = await prisma.user.update({
    where: { id },
    data,
    select: userSelect,
  });

  return NextResponse.json({
    success: true,
    message: "User updated successfully",
    data: updated,
  });
}

// ---------------------------------------------------------------------------
// PATCH — full edit form (multipart)
// ---------------------------------------------------------------------------

async function handleFullUpdate(
  request: NextRequest,
  id: string,
  existingEmail: string,
) {
  const formData = await request.formData();

  const name = String(formData.get("name") ?? "");
  const email = String(formData.get("email") ?? "");
  const phone = String(formData.get("phone") ?? "");
  const role = String(formData.get("role") ?? "");
  const status = String(formData.get("status") ?? "");
  const isVerified = formData.get("isVerified") === "true";
  const password = String(formData.get("password") ?? "");
  const image = formData.get("image");
  const removeImage = formData.get("removeImage") === "true";

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

  const data = parsed.data;

  if (existingEmail.toLowerCase() !== data.email) {
    const conflict = await prisma.user.findUnique({
      where: { email: data.email },
      select: { id: true },
    });

    if (conflict && conflict.id !== id) {
      return NextResponse.json(
        { success: false, message: "A user with this email already exists" },
        { status: 409 },
      );
    }
  }

  let nextPassword: string | undefined;
  if (password) {
    nextPassword = await bcrypt.hash(
      password,
      Number(config.bcrypt_salt_rounds),
    );
  }

  let nextImage: string | null | undefined;

  if (image instanceof File) {
    const { secure_url } = await uploadToCloudinary(image);
    nextImage = secure_url;
  } else if (removeImage) {
    nextImage = null;
  }

  const updated = await prisma.user.update({
    where: { id },
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone?.trim() || null,
      role: data.role,
      status: data.status,
      isVerified: data.isVerified ?? false,
      ...(nextPassword ? { password: nextPassword } : {}),
      ...(nextImage !== undefined ? { image: nextImage } : {}),
    },
    select: userSelect,
  });

  return NextResponse.json({
    success: true,
    message: "User updated successfully",
    data: updated,
  });
}

// ---------------------------------------------------------------------------
// DELETE /api/admin/users/[id]
// ---------------------------------------------------------------------------
// Hard-deletes the user along with their listings (cascade in the schema).
// ---------------------------------------------------------------------------

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const existing = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    await prisma.user.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: `"${existing.name}" deleted successfully`,
    });
  } catch (error) {
    console.error("Delete admin user error:", error);

    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 },
    );
  }
}
