import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { categoryFormSchema } from "@/lib/schemas/category-schema";
import { slugify, uniqueSlug } from "@/lib/slug";

// Generic Prisma category row (flat)
type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  parentId: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  children: unknown[];
};

export type CategoryNode = CategoryRow & {
  children: CategoryNode[];
  _count: { children: number };
};

function buildTree(rows: CategoryRow[]): CategoryNode[] {
  const nodeMap = new Map<
    string,
    CategoryNode & { _count: { children: number } }
  >();

  for (const row of rows) {
    nodeMap.set(row.id, {
      ...row,
      children: [],
      _count: { children: 0 },
    });
  }

  const roots: CategoryNode[] = [];

  for (const node of nodeMap.values()) {
    if (node.parentId) {
      const parent = nodeMap.get(node.parentId);

      if (parent) {
        parent.children.push(node);
        parent._count.children += 1;
        continue;
      }
    }

    roots.push(node);
  }

  return roots;
}

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { createdAt: "asc" },
    });

    const tree = buildTree(categories as CategoryRow[]);

    return NextResponse.json({
      success: true,
      data: tree,
    });
  } catch (error) {
    console.error("Get categories error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const parsed = categoryFormSchema.safeParse(body);

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

    const { name, slug, description, image, parentId, isActive } = parsed.data;

    if (parentId) {
      const parent = await prisma.category.findUnique({
        where: { id: parentId },
      });

      if (!parent) {
        return NextResponse.json(
          {
            success: false,
            message: "Parent category not found",
          },
          { status: 400 },
        );
      }
    }

    const generatedSlug = slug.trim() || slugify(name);
    const finalSlug = await uniqueSlug(generatedSlug, (candidate) =>
      prisma.category
        .findUnique({ where: { slug: candidate }, select: { id: true } })
        .then((found) => found !== null),
    );

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        slug: finalSlug,
        description: description?.trim() || null,
        image: image?.trim() || null,
        parentId: parentId || null,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Category created successfully",
        data: category,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create category error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 },
    );
  }
}
