import { prisma } from "@toolnova/database";
import { CATEGORY_SEED, TOOL_SEED } from "../src/lib/tool-seed";
import { stringifyToolMetadata } from "../src/lib/tool-metadata";

async function main() {
  let created = 0;
  let updated = 0;

  for (const cat of CATEGORY_SEED) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description, icon: cat.icon },
      create: { name: cat.name, slug: cat.slug, description: cat.description, icon: cat.icon },
    });
  }

  for (const tool of TOOL_SEED) {
    const category = await prisma.category.findUnique({ where: { slug: tool.category } });
    if (!category) {
      console.warn(`Skipping ${tool.slug}: category "${tool.category}" not found`);
      continue;
    }
    const existing = await prisma.tool.findUnique({ where: { slug: tool.slug } });
    await prisma.tool.upsert({
      where: { slug: tool.slug },
      update: {
        name: tool.name,
        description: tool.description,
        categoryId: category.id,
        status: "PUBLISHED",
        metadata: stringifyToolMetadata({
          badges: tool.badges,
          time: tool.time,
          uses: tool.uses,
          free: tool.free,
        }),
      },
      create: {
        name: tool.name,
        slug: tool.slug,
        description: tool.description,
        categoryId: category.id,
        status: "PUBLISHED",
        views: 0,
        metadata: stringifyToolMetadata({
          badges: tool.badges,
          time: tool.time,
          uses: tool.uses,
          free: tool.free,
        }),
      },
    });
    if (existing) updated += 1;
    else created += 1;
  }

  const categories = await prisma.category.findMany();
  for (const c of categories) {
    const count = await prisma.tool.count({ where: { categoryId: c.id } });
    await prisma.category.update({ where: { id: c.id }, data: { toolCount: count } });
  }

  console.log(
    `Seed complete: ${created} tools created, ${updated} tools updated, ${categories.length} categories.`
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
