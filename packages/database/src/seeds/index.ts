import { prisma } from "../client";
import bcrypt from "bcryptjs";

async function main() {
  console.log("Seeding database...");

  // Create categories
  const categoryData = [
    { name: "Text Tools", slug: "text-tools", description: "Tools for text manipulation and analysis" },
    { name: "Image Tools", slug: "image-tools", description: "Tools for image processing and optimization" },
    { name: "Developer Tools", slug: "developer-tools", description: "Tools for developers and programmers" },
    { name: "Calculators", slug: "calculators", description: "Various calculation tools" },
    { name: "Converters", slug: "converters", description: "Tools for converting between formats" },
    { name: "Generators", slug: "generators", description: "Tools that generate content" },
    { name: "Security Tools", slug: "security-tools", description: "Tools for security and encryption" },
    { name: "Design Tools", slug: "design-tools", description: "Tools for designers" },
    { name: "Document Tools", slug: "document-tools", description: "Tools for document management" },
    { name: "SEO Tools", slug: "seo-tools", description: "Tools for search engine optimization" },
  ];

  const categories = await Promise.all(
    categoryData.map((cat) =>
      prisma.category.upsert({
        where: { slug: cat.slug },
        update: {},
        create: cat,
      })
    )
  );
  console.log(`Created ${categories.length} categories`);

  // Create tools
  const toolData = [
    { name: "Word Counter", slug: "word-counter", description: "Count words, characters, and sentences in your text", categorySlug: "text-tools" },
    { name: "JSON Formatter", slug: "json-formatter", description: "Format, validate, and beautify JSON data", categorySlug: "developer-tools" },
    { name: "Image Compressor", slug: "image-compressor", description: "Compress images without losing quality", categorySlug: "image-tools" },
    { name: "UUID Generator", slug: "uuid-generator", description: "Generate universally unique identifiers", categorySlug: "developer-tools" },
    { name: "Password Generator", slug: "password-generator", description: "Generate strong random passwords", categorySlug: "security-tools" },
    { name: "Color Picker", slug: "color-picker", description: "Pick and convert colors between formats", categorySlug: "design-tools" },
    { name: "QR Code Generator", slug: "qr-code-generator", description: "Generate QR codes from text or URLs", categorySlug: "generators" },
    { name: "PDF Merger", slug: "pdf-merger", description: "Merge multiple PDF files into one", categorySlug: "document-tools" },
    { name: "Resume Builder", slug: "resume-builder", description: "Build professional resumes with templates", categorySlug: "document-tools" },
    { name: "Character Counter", slug: "character-counter", description: "Count characters, words, and paragraphs", categorySlug: "text-tools" },
  ];

  const tools = [];
  for (const tool of toolData) {
    const category = categories.find((c) => c.slug === tool.categorySlug);
    if (!category) continue;
    const created = await prisma.tool.upsert({
      where: { slug: tool.slug },
      update: {},
      create: {
        name: tool.name,
        slug: tool.slug,
        description: tool.description,
        categoryId: category.id,
        status: "PUBLISHED",
      },
    });
    tools.push(created);
  }
  console.log(`Created ${tools.length} tools`);

  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@toolnova.com" },
    update: {},
    create: {
      email: "admin@toolnova.com",
      name: "Admin",
      password: hashedPassword,
      role: "ADMIN",
    },
  });
  console.log(`Created admin user: ${admin.email}`);

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
