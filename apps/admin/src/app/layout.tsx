import type { Metadata } from "next";
import { AdminLayout } from "@/components/admin/admin-layout";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "ToolNova Admin",
    template: "%s | ToolNova Admin",
  },
  description: "ToolNova Administration Panel",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const user = session?.user;

  let counts = { tools: 0, categories: 0, users: 0 };
  try {
    const [tools, categories, users] = await Promise.all([
      prisma.tool.count(),
      prisma.category.count(),
      prisma.user.count(),
    ]);
    counts = { tools, categories, users };
  } catch {
    counts = { tools: 0, categories: 0, users: 0 };
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <AdminLayout counts={counts} user={user}>{children}</AdminLayout>
      </body>
    </html>
  );
}
