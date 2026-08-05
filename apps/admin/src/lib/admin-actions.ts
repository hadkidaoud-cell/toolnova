"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { CATEGORY_SEED, TOOL_SEED } from "@/lib/tool-seed";
import { stringifyToolMetadata, type ToolMetadata } from "@/lib/tool-metadata";
import type { ActionResult, CategoryInput, ToolInput } from "@/lib/types";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function recountCategory(categoryId: number) {
  const count = await prisma.tool.count({ where: { categoryId } });
  await prisma.category.update({ where: { id: categoryId }, data: { toolCount: count } });
}

async function isUniqueSlug(slug: string, excludeId?: number): Promise<boolean> {
  const existing = await prisma.tool.findUnique({ where: { slug } });
  return !existing || (excludeId !== undefined && existing.id === excludeId);
}

export async function createTool(input: ToolInput): Promise<ActionResult<number>> {
  await requireAdmin();
  if (!input.name || !input.slug || !input.description || !input.categoryId) {
    return { success: false, error: "Name, slug, description, and category are required." };
  }
  const slug = slugify(input.slug);
  if (!(await isUniqueSlug(slug))) {
    return { success: false, error: `A tool with slug "${slug}" already exists.` };
  }
  const category = await prisma.category.findUnique({ where: { id: input.categoryId } });
  if (!category) {
    return { success: false, error: "Selected category does not exist." };
  }

  const metadata: ToolMetadata = {
    badges: input.badges ?? [],
    time: input.time ?? 1,
    uses: input.uses ?? 0,
    free: input.free ?? true,
  };

  const tool = await prisma.tool.create({
    data: {
      name: input.name.trim(),
      slug,
      description: input.description.trim(),
      longDescription: input.longDescription?.trim() || null,
      categoryId: input.categoryId,
      icon: input.icon?.trim() || null,
      status: input.status ?? "DRAFT",
      views: input.views ?? 0,
      featured: input.featured ?? false,
      metadata: stringifyToolMetadata(metadata),
    },
  });

  await recountCategory(input.categoryId);
  revalidatePath("/tools");
  revalidatePath("/dashboard");
  return { success: true, data: tool.id };
}

export async function updateTool(id: number, input: ToolInput): Promise<ActionResult> {
  await requireAdmin();
  const existing = await prisma.tool.findUnique({ where: { id } });
  if (!existing) return { success: false, error: "Tool not found." };
  if (!input.name || !input.slug || !input.description || !input.categoryId) {
    return { success: false, error: "Name, slug, description, and category are required." };
  }

  const slug = slugify(input.slug);
  if (!(await isUniqueSlug(slug, id))) {
    return { success: false, error: `A tool with slug "${slug}" already exists.` };
  }
  const category = await prisma.category.findUnique({ where: { id: input.categoryId } });
  if (!category) {
    return { success: false, error: "Selected category does not exist." };
  }

  const metadata: ToolMetadata = {
    badges: input.badges ?? [],
    time: input.time ?? 1,
    uses: input.uses ?? 0,
    free: input.free ?? true,
  };

  await prisma.tool.update({
    where: { id },
    data: {
      name: input.name.trim(),
      slug,
      description: input.description.trim(),
      longDescription: input.longDescription?.trim() || null,
      categoryId: input.categoryId,
      icon: input.icon?.trim() || null,
      status: input.status ?? existing.status,
      views: input.views ?? existing.views,
      featured: input.featured ?? existing.featured,
      metadata: stringifyToolMetadata(metadata),
    },
  });

  await recountCategory(existing.categoryId);
  if (existing.categoryId !== input.categoryId) await recountCategory(input.categoryId);
  revalidatePath("/tools");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteTool(id: number): Promise<ActionResult> {
  await requireAdmin();
  const existing = await prisma.tool.findUnique({ where: { id } });
  if (!existing) return { success: false, error: "Tool not found." };

  await prisma.tool.delete({ where: { id } });
  await recountCategory(existing.categoryId);
  revalidatePath("/tools");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function setToolStatus(
  id: number,
  status: "PUBLISHED" | "DRAFT" | "ARCHIVED"
): Promise<ActionResult> {
  await requireAdmin();
  const existing = await prisma.tool.findUnique({ where: { id } });
  if (!existing) return { success: false, error: "Tool not found." };

  await prisma.tool.update({ where: { id }, data: { status } });
  revalidatePath("/tools");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function createCategory(input: CategoryInput): Promise<ActionResult<number>> {
  await requireAdmin();
  if (!input.name || !input.slug) {
    return { success: false, error: "Name and slug are required." };
  }
  const slug = slugify(input.slug);
  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) {
    return { success: false, error: `A category with slug "${slug}" already exists.` };
  }

  const category = await prisma.category.create({
    data: {
      name: input.name.trim(),
      slug,
      description: input.description?.trim() || null,
      icon: input.icon?.trim() || null,
    },
  });

  revalidatePath("/categories");
  revalidatePath("/dashboard");
  return { success: true, data: category.id };
}

export async function updateCategory(id: number, input: CategoryInput): Promise<ActionResult> {
  await requireAdmin();
  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) return { success: false, error: "Category not found." };
  if (!input.name || !input.slug) {
    return { success: false, error: "Name and slug are required." };
  }

  const slug = slugify(input.slug);
  const clash = await prisma.category.findFirst({
    where: { slug, NOT: { id } },
  });
  if (clash) {
    return { success: false, error: `A category with slug "${slug}" already exists.` };
  }

  await prisma.category.update({
    where: { id },
    data: {
      name: input.name.trim(),
      slug,
      description: input.description?.trim() || null,
      icon: input.icon?.trim() || null,
    },
  });

  revalidatePath("/categories");
  revalidatePath("/tools");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteCategory(id: number): Promise<ActionResult> {
  await requireAdmin();
  const toolCount = await prisma.tool.count({ where: { categoryId: id } });
  if (toolCount > 0) {
    return {
      success: false,
      error: `Cannot delete category: it still contains ${toolCount} tool${toolCount > 1 ? "s" : ""}. Move or delete its tools first.`,
    };
  }
  await prisma.category.delete({ where: { id } });
  revalidatePath("/categories");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function syncCatalog(): Promise<ActionResult<{ created: number; updated: number; categories: number }>> {
  await requireAdmin();
  let created = 0;
  let updated = 0;

  for (const cat of CATEGORY_SEED) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description, icon: cat.icon },
      create: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        icon: cat.icon,
      },
    });
  }

  for (const tool of TOOL_SEED) {
    const category = await prisma.category.findUnique({ where: { slug: tool.category } });
    if (!category) continue;

    const metadata: ToolMetadata = {
      badges: tool.badges,
      time: tool.time,
      uses: tool.uses,
      free: tool.free,
    };

    const existing = await prisma.tool.findUnique({ where: { slug: tool.slug } });
    await prisma.tool.upsert({
      where: { slug: tool.slug },
      update: {
        name: tool.name,
        description: tool.description,
        categoryId: category.id,
        status: "PUBLISHED",
        metadata: stringifyToolMetadata(metadata),
      },
      create: {
        name: tool.name,
        slug: tool.slug,
        description: tool.description,
        categoryId: category.id,
        status: "PUBLISHED",
        views: 0,
        metadata: stringifyToolMetadata(metadata),
      },
    });
    if (existing) updated += 1;
    else created += 1;
  }

  const categories = await Promise.all(
    (await prisma.category.findMany()).map(async (c) => {
      await recountCategory(c.id);
      return c.id;
    })
  );

  revalidatePath("/tools");
  revalidatePath("/categories");
  revalidatePath("/dashboard");
  return { success: true, data: { created, updated, categories: categories.length } };
}
