import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { categoryFormSchema } from "@/lib/schemas/category-schema";
import { slugify, uniqueSlug } from "@/lib/slug";

type RouteContext = {
  params: Promise<{ id: string }>;
};

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

    const suppliedSlug = slug.trim() || slugify(name);
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

    const category = await prisma.category.update({
      where: { id },
      data: {
        name: name.trim(),
        slug: finalSlug,
        description: description?.trim() || null,
        image: image?.trim() || null,
        parentId: nextParentId,
        isActive: isActive ?? existing.isActive,
      },
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
