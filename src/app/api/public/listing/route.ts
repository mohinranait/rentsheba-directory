import bcrypt from "bcryptjs";
import crypto from "crypto";
import ejs from "ejs";
import { NextResponse } from "next/server";
import path from "path";
import config from "@/lib/config";
import { transporter } from "@/lib/nodemailer";
import { prisma } from "@/lib/prisma";
import { connectRedis } from "@/lib/radis";
import {
  type ListingFormValues,
  listingFormSchema,
} from "@/lib/schemas/listing-schema";
import { uploadAndCreateMedia } from "@/utils/upload-media";
import { ListingStatus } from "../../../../../generated/prisma/enums";

const OTP_EXPIRE_SECONDS = 5 * 60;

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 48;

export type PublicListingItem = {
  id: string;
  title: string;
  slug: string;
  tagline: string | null;
  shortDescription: string | null;
  priceRange: string | null;
  isFeatured: boolean;
  isClaimed: boolean;
  averageRating: number;
  reviewCount: number;
  viewCount: number;
  favoriteCount: number;
  publishedAt: Date | string | null;
  thumbnail: { secure_url: string; alt: string | null } | null;
  category: { name: string; slug: string } | null;
  location: { nameEn: string; nameLocal: string; type: string } | null;
};

export type PublicListingResponse = {
  success: boolean;
  data: {
    items: PublicListingItem[];
    meta: {
      total: number;
      page: number;
      pageSize: number;
      totalPages: number;
    };
  };
};

// ---------------------------------------------------------------------------
// GET /api/public/listing
// ---------------------------------------------------------------------------
// Visitor-facing browse endpoint. Only approved listings are exposed. Used
// server-side by the homepage (Explores) as well as any client-side browse
// pages. Responses are CDN-cacheable for fast, SEO-friendly delivery.
//
// Query params:
//   search     Partial match on title, tagline or description
//   category   Category slug (also accepts `categoryId`)
//   locationId Restrict to a location and all of its descendants
//   featured   "true" filters to featured listings only
//   sortBy     latest (default) | featured | popular | rating
//   page       1-based page number (default: 1)
//   pageSize   Items per page (default: 10, max: 48)
// ---------------------------------------------------------------------------

const PUBLIC_LISTING_SELECT = {
  id: true,
  title: true,
  slug: true,
  tagline: true,
  shortDescription: true,
  priceRange: true,
  isFeatured: true,
  isClaimed: true,
  averageRating: true,
  reviewCount: true,
  viewCount: true,
  favoriteCount: true,
  publishedAt: true,
  thumbnail: { select: { secure_url: true, alt: true } },
  category: { select: { name: true, slug: true } },
  location: { select: { nameEn: true, nameLocal: true, type: true } },
} as const;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const page = Math.max(1, Number(searchParams.get("page") ?? 1) || 1);
    const pageSize = Math.min(
      MAX_PAGE_SIZE,
      Math.max(
        1,
        Number(searchParams.get("pageSize") ?? DEFAULT_PAGE_SIZE) ||
        DEFAULT_PAGE_SIZE,
      ),
    );

    const search = searchParams.get("search")?.trim() ?? "";
    const categorySlug = searchParams.get("category")?.trim() ?? "";
    const categoryId = searchParams.get("categoryId")?.trim() ?? "";
    const locationId = searchParams.get("locationId")?.trim() ?? "";
    const featuredOnly = searchParams.get("featured") === "true";

    const where = {
      verificationStatus: ListingStatus.APPROVED,
      ...(search
        ? {
          OR: [
            { title: { contains: search, mode: "insensitive" as const } },
            { tagline: { contains: search, mode: "insensitive" as const } },
            {
              shortDescription: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
            {
              description: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
          ],
        }
        : {}),
      ...(categorySlug ? { category: { slug: categorySlug as string } } : {}),
      ...(categoryId ? { categoryId } : {}),
      ...(featuredOnly ? { isFeatured: true } : {}),
      ...(locationId
        ? { locationId: { in: await collectLocationIds(locationId) } }
        : {}),
    };

    const orderBy =
      searchParams.get("sortBy") === "featured"
        ? [{ isFeatured: "desc" as const }, { viewCount: "desc" as const }]
        : searchParams.get("sortBy") === "popular"
          ? { viewCount: "desc" as const }
          : searchParams.get("sortBy") === "rating"
            ? [
              { averageRating: "desc" as const },
              { reviewCount: "desc" as const },
            ]
            : [
              { isFeatured: "desc" as const },
              { publishedAt: "desc" as const },
            ];

    const [total, items] = await Promise.all([
      prisma.listing.count({ where }),
      prisma.listing.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: PUBLIC_LISTING_SELECT,
      }),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: {
          items,
          meta: {
            total,
            page,
            pageSize,
            totalPages: Math.max(1, Math.ceil(total / pageSize)),
          },
        },
      } satisfies PublicListingResponse,
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      },
    );
  } catch (error) {
    console.error("Get public listings error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 },
    );
  }
}

// Returns a location id and every descendant id (division → district →
// upazila) so filtering by a parent also matches all of its children.
async function collectLocationIds(locationId: string): Promise<string[]> {
  const locations = await prisma.location.findMany({
    select: { id: true, parentId: true },
  });

  const childrenByParent = new Map<string | null, string[]>();

  for (const location of locations) {
    const siblings = childrenByParent.get(location.parentId) ?? [];
    siblings.push(location.id);
    childrenByParent.set(location.parentId, siblings);
  }

  const ids: string[] = [];

  const walk = (id: string) => {
    ids.push(id);
    for (const childId of childrenByParent.get(id) ?? []) {
      walk(childId);
    }
  };

  walk(locationId);

  return ids;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// Convert the multipart FormData back into the exact shape the zod schema
// expects, so we can validate it on the server in one place.
function parseFormData(formData: FormData): ListingFormValues {
  const asString = (key: string) => String(formData.get(key) ?? "");
  const asJSON = (key: string) => {
    const raw = formData.get(key);
    if (!raw) return undefined;

    try {
      return JSON.parse(String(raw));
    } catch {
      return undefined;
    }
  };

  const establishedYear = asString("establishedYear");

  return {
    // Step 1 — Basic information
    title: asString("title"),
    tagline: asString("tagline"),
    categoryId: asString("categoryId"),
    shortDescription: asString("shortDescription"),
    description: asString("description"),

    // Step 2 — Location & contact
    locationId: asString("locationId"),
    addressLine1: asString("addressLine1"),
    phone: asString("phone"),
    email: asString("email"),
    website: asString("website"),
    whatsapp: asString("whatsapp"),
    socialLinks: asJSON("socialLinks") ?? {
      facebook: "",
      instagram: "",
      youtube: "",
      linkedin: "",
      tiktok: "",
    },

    // Step 3 — Business details
    establishedYear: establishedYear ? Number(establishedYear) : undefined,
    priceRange: (asString("priceRange") ||
      undefined) as ListingFormValues["priceRange"],
    areaServed: asString("areaServed"),
    openingHours: asJSON("openingHours"),
    features: asJSON("features"),
    faqs: asJSON("faqs"),

    // Step 5 — Photos
    logo: (formData.get("logo") as File | null) ?? null,
    cover: formData.get("cover") as File,
    gallery: Array.from(formData.getAll("gallery") as File[]),

    // Step 6 — Account
    loginEmail: asString("loginEmail"),
    password: asString("password"),
    confirmPassword: asString("confirmPassword"),
    agreeToTerms: (asString("agreeToTerms") === "true") as true,
  };
}

// ---------------------------------------------------------------------------
// POST /api/public/listing
// ---------------------------------------------------------------------------
// Receives the full listing wizard form, validates it, uploads the images,
// then stores everything in Redis and emails a verification OTP.
// The actual user + listing creation happens in /api/auth/verify-email
// after the email is confirmed.
// ---------------------------------------------------------------------------

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const values = parseFormData(formData);

    // Server-side validation using the same schema as the form
    const parsed = listingFormSchema.safeParse(values);

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
    const email = data.loginEmail.trim().toLowerCase();

    // A user can only own one account
    const isUserExists = await prisma.user.findUnique({
      where: { email },
    });

    if (isUserExists) {
      throw new Error("User with this email already exists");
    }

    // Hash the password before it touches Redis
    const hashedPassword = await bcrypt.hash(
      data.password,
      Number(config.bcrypt_salt_rounds),
    );

    // 1 — Upload the cover (mandatory) → shows as the listing thumbnail
    const cover = await uploadAndCreateMedia(data.cover, data.title);

    // 2 — Upload the logo (optional)
    const logo = data.logo
      ? await uploadAndCreateMedia(data.logo, `${data.title} logo`)
      : null;

    // 3 — Upload every gallery image (optional, max 8)
    const gallery = await Promise.all(
      data.gallery.map((file, index) =>
        uploadAndCreateMedia(file, `${data.title} - ছবি ${index + 1}`),
      ),
    );

    // Store everything in Redis so /api/auth/verify-email can finish the job
    const redis = await connectRedis();

    const otp = crypto.randomInt(100000, 1000000);
    const verifyOtpKey = `verify-email-otp:${email}`;
    await redis.set(verifyOtpKey, otp, {
      expiration: {
        type: "EX",
        value: OTP_EXPIRE_SECONDS,
      },
    });

    const registerUserKey = `register-user-data:${email}`;
    const redisPayload = {
      name: data.title,
      email,
      password: hashedPassword,
      listing: {
        title: data.title,
        tagline: data.tagline,
        categoryId: data.categoryId,
        shortDescription: data.shortDescription,
        description: data.description,
        locationId: data.locationId,
        addressLine1: data.addressLine1,
        phone: data.phone,
        email: data.email,
        website: data.website,
        whatsapp: data.whatsapp,
        socialLinks: data.socialLinks,
        establishedYear: data.establishedYear,
        priceRange: data.priceRange,
        areaServed: data.areaServed,
        openingHours: data.openingHours,
        features: data.features,
        faqs: data.faqs,
      },
      media: {
        logoId: logo?.id ?? null,
        thumbnailId: cover.id,
        galleryIds: gallery.map((media) => media.id),
      },
    };

    await redis.set(registerUserKey, JSON.stringify(redisPayload), {
      expiration: {
        type: "EX",
        value: OTP_EXPIRE_SECONDS,
      },
    });

    // Send the verification email
    const templatePath = path.join(
      process.cwd(),
      "src/templates/verify-email.ejs",
    );

    const html = await ejs.renderFile(templatePath, {
      name: data.title,
      otp,
      expireTime: OTP_EXPIRE_SECONDS,
    });

    await transporter.sendMail({
      from: config.email_sender,
      to: email,
      subject: "Verify Your Email - RentSheba",
      html,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Verification OTP sent successfully",
        data: { email },
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
