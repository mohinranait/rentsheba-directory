import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ---------------------------------------------------------------------------
// GET /api/locations/tree
// ---------------------------------------------------------------------------
// Returns the whole Bangladesh location hierarchy (division → district →
// upazila) in one call, so the listing form can render cascading selects
// and also restore a previously saved location without extra round-trips.
// ---------------------------------------------------------------------------

export type LocationNode = {
  id: string;
  nameEn: string;
  nameLocal: string;
  type: "DIVISION" | "DISTRICT" | "UPAZILA";
  children: LocationNode[];
};

export async function GET() {
  try {
    const locations = await prisma.location.findMany({
      select: {
        id: true,
        nameEn: true,
        nameLocal: true,
        type: true,
        parentId: true,
      },
      orderBy: { nameEn: "asc" },
    });

    // Group every location under its parent in a single pass
    const childrenByParent = new Map<string | null, typeof locations>();

    for (const location of locations) {
      const key = location.parentId;
      const siblings = childrenByParent.get(key) ?? [];
      siblings.push(location);
      childrenByParent.set(key, siblings);
    }

    const buildTree = (parentId: string | null): LocationNode[] =>
      (childrenByParent.get(parentId) ?? []).map((location) => ({
        id: location.id,
        nameEn: location.nameEn,
        nameLocal: location.nameLocal,
        type: location.type,
        children: buildTree(location.id),
      }));

    return NextResponse.json({
      success: true,
      data: buildTree(null),
    });
  } catch (error) {
    console.error("Get location tree error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 },
    );
  }
}
