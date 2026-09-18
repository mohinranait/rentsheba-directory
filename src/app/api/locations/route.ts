import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const LOCATION_TYPES = [
  "DIVISION",
  "DISTRICT",
  "UPAZILA",
] as const;

type LocationType = (typeof LOCATION_TYPES)[number];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    console.log("HIT URL");
    

    const type = searchParams.get("type") as LocationType | null;
    const parentId = searchParams.get("parentId");

    // Validate type
    if (!type || !LOCATION_TYPES.includes(type)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid location type",
        },
        { status: 400 },
      );
    }

    // Division has no parent
    if (type === "DIVISION") {
      const locations = await prisma.location.findMany({
        where: {
          type: "DIVISION",
          parentId: null,
        },
        orderBy: {
          nameEn: "asc",
        },
        select: {
          id: true,
          nameEn: true,
          nameLocal: true,
          slug: true,
          lat: true,
          lon: true,
          postalCode: true,
          type: true,
        },
      });

      return NextResponse.json({
        success: true,
        data: locations,
      });
    }

    // District / Upazila requires parentId
    if (!parentId) {
      return NextResponse.json(
        {
          success: false,
          message: "parentId is required",
        },
        { status: 400 },
      );
    }

    const locations = await prisma.location.findMany({
      where: {
        type,
        parentId,
      },
      orderBy: {
        nameEn: "asc",
      },
      select: {
        id: true,
        nameEn: true,
        nameLocal: true,
        slug: true,
        lat: true,
        lon: true,
        postalCode: true,
        type: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: locations,
    });
  } catch (error) {
    console.error("Get locations error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch locations",
      },
      { status: 500 },
    );
  }
}