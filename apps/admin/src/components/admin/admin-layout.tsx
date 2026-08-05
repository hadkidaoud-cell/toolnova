"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  Archive,
  BarChart3,
  Folder,
  LayoutDashboard,
  Menu,
  ScrollText,
  Search,
  Settings,
  User,
  Users,
  Wrench,
} from "lucide-react";
import { cn } from "@toolnova/utils";
import { Toaster } from "@/components/admin/toaster";
import { SignOutButton } from "@/components/admin/sign-out-button";

interface AdminLayoutProps {
  children: React.ReactNode;
  counts: { tools: number; categories: number; users: number };
  user?: { name?: string | null; email?: string | null };
}

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Tools", href: "/tools", icon: Wrench },
  { label: "Categories", href: "/categories", icon: Folder },
  { label: "Users", href: "/users", icon: Users },
  { label: "SEO", href: "/seo", icon: Search },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Logs", href: "/logs", icon: ScrollText },
  { label: "Backups", href: "/backups", icon: Archive },
  { label: "Profile", href: "/profile", icon: User },
];

const COUNT_KEYS: Record<string, keyof AdminLayoutProps["counts"]> = {
  "/tools": "tools",
  "/categories": "categories",
  "/users": "users",
};

function isActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard" || pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export function AdminLayout({ children, counts, user }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const displayName = user?.name || "Admin";
  const displayEmail = user?.email || "admin@toolnova.com";
  const avatarLetter = (displayName[0] ?? "A").toUpperCase();

  return (
    <div className="flex h-screen bg-neutral-100 dark:bg-neutral-900">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 transform flex-col border-r border-neutral-200 bg-white transition-transform duration-200 dark:border-neutral-800 dark:bg-neutral-950 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 shrink-0 items-center border-b border-neutral-200 px-6 dark:border-neutral-800">
          <a href="/dashboard" className="text-xl font-bold text-neutral-900 dark:text-white">
            Tool<span className="text-brand-600">Nova</span>
          </a>
          <span className="ml-2 rounded bg-brand-100 px-1.5 py-0.5 text-xs font-medium text-brand-700 dark:bg-brand-900/30 dark:text-brand-400">
            Admin
          </span>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const active = isActive(pathname, item.href);
              const countKey = COUNT_KEYS[item.href];
              const count = countKey ? counts[countKey] : undefined;
              return (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300"
                        : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white"
                    )}
                  >
                    <item.icon className={cn("h-5 w-5 shrink-0", active && "text-brand-600 dark:text-brand-400")} />
                    {item.label}
                    {count !== undefined && (
                      <span
                        className={cn(
                          "ml-auto rounded-full px-2 py-0.5 text-xs font-medium",
                          active
                            ? "bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
                            : "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
                        )}
                      >
                        {count}
                      </span>
                    )}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="shrink-0 space-y-2 border-t border-neutral-200 p-4 dark:border-neutral-800">
          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            <Wrench className="h-4 w-4" />
            View Site
          </a>
          <SignOutButton />
        </div>
      </aside>

      <div className="flex flex-1 flex-col lg:pl-64">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-neutral-200 bg-white px-4 dark:border-neutral-800 dark:bg-neutral-950 lg:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="hidden items-center gap-2 text-sm text-neutral-500 lg:flex">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              Live
            </span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="http://localhost:3000"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-2 rounded-lg border border-neutral-200 px-3 py-1.5 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-50 sm:inline-flex dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              <Wrench className="h-4 w-4" />
              View Site
            </a>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-sm font-medium text-white">
                {avatarLetter}
              </div>
              <div className="hidden text-sm sm:block">
                <div className="font-medium text-neutral-900 dark:text-white">{displayName}</div>
                <div className="text-neutral-500">{displayEmail}</div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>

      <Toaster />
    </div>
  );
}
