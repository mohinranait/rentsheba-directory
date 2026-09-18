import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { categoryFormSchema } from "@/lib/schemas/category-schema";
import { slugify, uniqueSlug } from "@/lib/slug";
import { uploadToCloudinary } from "@/utils/upload-image";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const imageSelect = {
  select: {
    id: true,
    url: true,
    secure_url: true,
    alt: true,
  },
} as const;

async function getDescendantIds(id: string): Promise<string[]> {
  const all = await prisma.category.findMany({
    select: { id: true, parentId: true },
  });

  const childrenByParent = new Map<string | null, string[]>();

  for (const category of all) {
    const list = childrenByParent.get(category.parentId) ?? [];
    list.push(category.id);
    childrenByParent.set(category.parentId, list);
  }

  const descendantIds: string[] = [];
  const stack = [id];

  while (stack.length > 0) {
    const current = stack.pop();

    if (current === undefined) {
      break;
    }

    for (const child of childrenByParent.get(current) ?? []) {
      descendantIds.push(child);
      stack.push(child);
    }
  }

  return descendantIds;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        parent: { select: { id: true, name: true } },
        image: imageSelect,
        _count: { select: { children: true } },
      },
    });

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          message: "Category not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error("Get category error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    const existing = await prisma.category.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          message: "Category not found",
        },
        { status: 404 },
      );
    }

    const formData = await request.formData();

    const name = String(formData.get("name") ?? "");
    const slug = String(formData.get("slug") ?? "");
    const description = String(formData.get("description") ?? "");
    const parentId = String(formData.get("parentId") ?? "");
    const isActive = formData.get("isActive") === "true";
    const removeImage = formData.get("removeImage") === "true";
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

    const nextParentId = parentId || null;

    if (nextParentId) {
      if (nextParentId === id) {
        return NextResponse.json(
          {
            success: false,
            message: "A category cannot be its own parent",
          },
          { status: 400 },
        );
      }

      const parent = await prisma.category.findUnique({
        where: { id: nextParentId },
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

      const descendantIds = await getDescendantIds(id);

      if (descendantIds.includes(nextParentId)) {
        return NextResponse.json(
          {
            success: false,
            message: "A category cannot be moved under one of its own children",
          },
          { status: 400 },
        );
      }
    }

    const suppliedSlug = categorySlug.trim() || slugify(categoryName);
    const finalSlug =
      suppliedSlug === existing.slug
        ? existing.slug
        : await uniqueSlug(suppliedSlug, (candidate) =>
            prisma.category
              .findFirst({
                where: { slug: candidate, id: { not: id } },
                select: { id: true },
              })
              .then((found) => found !== null),
          );

    let imageId = existing.imageId;

    if (removeImage) {
      imageId = null;
    } else if (image instanceof File) {
      const { secure_url, public_id, extension, size } =
        await uploadToCloudinary(image);

      const media = await prisma.media.create({
        data: {
          url: secure_url,
          alt: categoryName,
          public_id,
          extension,
          secure_url,
          size: String(size),
        },
      });

      imageId = media.id;
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name: categoryName.trim(),
        slug: finalSlug,
        description: description.trim() || null,
        imageId,
        parentId: nextParentId,
        isActive,
      },
      include: { image: imageSelect },
    });

    return NextResponse.json({
      success: true,
      message: "Category updated successfully",
      data: category,
    });
  } catch (error) {
    console.error("Update category error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    const existing = await prisma.category.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          message: "Category not found",
        },
        { status: 404 },
      );
    }

    const deleted = await prisma.category.delete({
      where: { id },
      select: { id: true, name: true },
    });

    return NextResponse.json({
      success: true,
      message: `"${deleted.name}" deleted successfully`,
      data: deleted,
    });
  } catch (error) {
    console.error("Delete category error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 },
    );
  }
}
