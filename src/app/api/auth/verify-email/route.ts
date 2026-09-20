import type { SignOptions } from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import config from "@/lib/config";
import { prisma } from "@/lib/prisma";
import { connectRedis } from "@/lib/radis";
import { slugify, uniqueSlug } from "@/lib/slug";
import { jwtUtils } from "@/utils/jwt";
import {
  ListingStatus,
  UserRole,
  UserStatus,
} from "../../../../../generated/prisma/enums";

// ---------------------------------------------------------------------------
// POST /api/auth/verify-email
// ---------------------------------------------------------------------------
// Verifies the OTP that was emailed by /api/public/listing, then creates the
// real account + listing using the data that was stored in Redis.
// ---------------------------------------------------------------------------

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const { email, otp } = await request.json();

    const existsUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existsUser?.isVerified) {
      throw new Error("Email already verified");
    }

    if (existsUser?.status === UserStatus.BLOCKED) {
      throw new Error("User is blocked");
    }

    if (existsUser?.status === UserStatus.DELETED) {
      throw new Error("User is deleted");
    }

    const redis = await connectRedis();

    // 1 — Verify the OTP
    const verifyOtpKey = `verify-email-otp:${email}`;
    const redisOtp = await redis.get(verifyOtpKey);

    if (!redisOtp || redisOtp !== otp) {
      throw new Error("OTP does not match");
    }

    await redis.del(verifyOtpKey);

    // 2 — Load the listing data submitted by /api/public/listing
    const registerUserKey = `register-user-data:${email}`;
    const rawPayload = await redis.get(registerUserKey);

    if (!rawPayload) {
      throw new Error("User does not exist");
    }

    const payload = JSON.parse(rawPayload);
    const { listing, media } = payload;

    // 3 — Build a unique slug from the listing title
    const baseSlug = slugify(listing.title) || `listing-${Date.now()}`;
    const slug = await uniqueSlug(baseSlug, (candidate) =>
      prisma.listing
        .findUnique({ where: { slug: candidate }, select: { id: true } })
        .then((found) => found !== null),
    );

    // 4 — Create the account + listing (category, location & all images)
    const createdUser = await prisma.user.create({
      data: {
        name: payload.name,
        email: payload.email,
        password: payload.password,
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        isVerified: true,
        listings: {
          create: {
            title: listing.title,
            slug,
            tagline: listing.tagline,
            shortDescription: listing.shortDescription,
            description: listing.description,
            phone: listing.phone,
            email: listing.email,
            website: listing.website,
            whatsapp: listing.whatsapp,
            addressLine1: listing.addressLine1,
            establishedYear: listing.establishedYear,
            priceRange: listing.priceRange,
            areaServed: listing.areaServed,
            socialLinks: listing.socialLinks,
            openingHours: listing.openingHours,
            features: listing.features,
            faqs: listing.faqs,
            verificationStatus: ListingStatus.PENDING,
            category: listing.categoryId
              ? { connect: { id: listing.categoryId } }
              : undefined,
            location: listing.locationId
              ? { connect: { id: listing.locationId } }
              : undefined,
            logo: media.logoId ? { connect: { id: media.logoId } } : undefined,
            thumbnail: { connect: { id: media.thumbnailId } },
            gallery:
              media.galleryIds.length > 0
                ? { connect: media.galleryIds.map((id: string) => ({ id })) }
                : undefined,
          },
        },
      },
      omit: { password: true },
      include: { listings: true },
    });

    await redis.del(registerUserKey);

    // 5 — Log the user in right away
    const { listings, ...user } = createdUser;
    const jwtPayload = {
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    const accessToken = jwtUtils.createToken(
      jwtPayload,
      config.jwt_access_secret,
      config.jwt_access_expires_in as SignOptions,
    );

    cookieStore.set("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24, // 24 hour or 1 day
    });

    // Public marker so the client header knows it should call /api/me
    // (avoids making the call when the visitor is logged out).
    cookieStore.set("auth_status", "1", {
      httpOnly: false,
      secure: false,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Verification successfully",
        data: { accessToken, user },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create user error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 },
    );
  }
}
