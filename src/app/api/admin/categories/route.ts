import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { categoryFormSchema } from "@/lib/schemas/category-schema";
import { slugify, uniqueSlug } from "@/lib/slug";
import { uploadToCloudinary } from "@/utils/upload-image";

export type CategoryImage = {
  id: string;
  url: string;
  secure_url: string;
  alt: string | null;
};

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageId: string | null;
  image: CategoryImage | null;
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

const imageSelect = {
  select: {
    id: true,
    url: true,
    secure_url: true,
    alt: true,
  },
} as const;

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: { image: imageSelect },
      orderBy: { createdAt: "asc" },
    });

    const tree = buildTree(categories as unknown as CategoryRow[]);

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

async function uploadAndCreateMedia(image: File, alt: string) {
  const { secure_url, public_id, extension, size } =
    await uploadToCloudinary(image);

  return prisma.media.create({
    data: {
      url: secure_url,
      alt,
      public_id,
      extension,
      secure_url,
      size: String(size),
    },
  });
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const name = String(formData.get("name") ?? "");
    const slug = String(formData.get("slug") ?? "");
    const description = String(formData.get("description") ?? "");
    const parentId = String(formData.get("parentId") ?? "");
    const isActive = formData.get("isActive") === "true";
    const image = formData.get("image");

    const parsed = categoryFormSchema.safeParse({
      name,
      slug,
      description,
      parentId,
      isActive,
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

    const { name: categoryName, slug: categorySlug } = parsed.data;

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

    const generatedSlug = categorySlug.trim() || slugify(categoryName);
    const finalSlug = await uniqueSlug(generatedSlug, (candidate) =>
      prisma.category
        .findUnique({ where: { slug: candidate }, select: { id: true } })
        .then((found) => found !== null),
    );

    let imageId: string | null = null;

    if (image instanceof File) {
      const media = await uploadAndCreateMedia(image, categoryName);
      imageId = media.id;
    }

    const category = await prisma.category.create({
      data: {
        name: categoryName.trim(),
        slug: finalSlug,
        description: description.trim() || null,
        imageId,
        parentId: parentId || null,
        isActive,
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
