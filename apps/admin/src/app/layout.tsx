import type { Metadata } from "next";
import { AdminLayout } from "@/components/admin/admin-layout";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "ToolNova Admin",
    template: "%s | ToolNova Admin",
  },
  description: "ToolNova Administration Panel",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <AdminLayout>{children}</AdminLayout>
      </body>
    </html>
  );
}
