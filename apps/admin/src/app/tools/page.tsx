import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { parseToolMetadata } from "@/lib/tool-metadata";
import { getIcon } from "@/lib/icon-registry";
import { DeleteToolButton, SyncCatalogButton } from "@/components/tools/tool-actions";
import { StatusToggle } from "@/components/tools/status-toggle";

export const dynamic = "force-dynamic";

interface ToolsPageProps {
  searchParams: Promise<{ q?: string; status?: string; category?: string; sort?: string }>;
}

type SortKey = "updated" | "name" | "views" | "created";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "updated", label: "Recently updated" },
  { value: "created", label: "Recently created" },
  { value: "name", label: "Name (A–Z)" },
  { value: "views", label: "Most views" },
];

export default async function ToolsPage({ searchParams }: ToolsPageProps) {
  const params = await searchParams;
  const q = params.q?.trim().toLowerCase() ?? "";
  const status = params.status;
  const categoryId = params.category ? Number(params.category) : undefined;
  const sort: SortKey = (params.sort as SortKey) ?? "updated";

  const orderBy: Record<string, "asc" | "desc"> =
    sort === "name" ? { name: "asc" } : sort === "created" ? { createdAt: "desc" } : { updatedAt: "desc" };

  const tools = await prisma.tool.findMany({
    include: { category: true },
    orderBy,
    where: {
      AND: [
        q
          ? {
              OR: [
                { name: { contains: q } },
                { slug: { contains: q } },
                { description: { contains: q } },
              ],
            }
          : {},
        status ? { status: status as "PUBLISHED" | "DRAFT" | "ARCHIVED" } : {},
        categoryId ? { categoryId } : {},
      ],
    },
  });

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  const sortedTools = sort === "views"
    ? [...tools].sort((a, b) => {
        const av = parseToolMetadata(a.metadata).uses > 0 && a.views === 0 ? parseToolMetadata(a.metadata).uses : a.views;
        const bv = parseToolMetadata(b.metadata).uses > 0 && b.views === 0 ? parseToolMetadata(b.metadata).uses : b.views;
        return bv - av;
      })
    : tools;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Tools</h1>
          <p className="mt-1 text-neutral-500 dark:text-neutral-400">
            {tools.length} tool{tools.length !== 1 ? "s" : ""} in your database
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <SyncCatalogButton />
          <Link
            href="/tools/new"
            className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700"
          >
            Add Tool
          </Link>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <form method="get" className="flex flex-wrap items-center gap-3 border-b border-neutral-200 p-4 dark:border-neutral-800">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Search tools by name, slug, or description..."
            className="w-full flex-1 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
          />
          <select
            name="category"
            defaultValue={categoryId ?? ""}
            className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            name="status"
            defaultValue={status ?? ""}
            className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
          >
            <option value="">All statuses</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
            <option value="ARCHIVED">Archived</option>
          </select>
          <select
            name="sort"
            defaultValue={sort}
            className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            Apply
          </button>
          {(q || status || categoryId || sort !== "updated") && (
            <Link
              href="/tools"
              className="rounded-lg px-3 py-2 text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
            >
              Reset
            </Link>
          )}
        </form>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-800/50">
              <tr>
                <th className="px-4 py-3 font-medium text-neutral-600 dark:text-neutral-400">Name</th>
                <th className="px-4 py-3 font-medium text-neutral-600 dark:text-neutral-400">Category</th>
                <th className="px-4 py-3 font-medium text-neutral-600 dark:text-neutral-400">Status</th>
                <th className="px-4 py-3 font-medium text-neutral-600 dark:text-neutral-400">Views</th>
                <th className="px-4 py-3 font-medium text-neutral-600 dark:text-neutral-400">Updated</th>
                <th className="px-4 py-3 font-medium text-neutral-600 dark:text-neutral-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {sortedTools.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-neutral-400">
                    {q || status || categoryId ? "No tools match your filters." : "No tools found. Click “Sync Catalog” or “Add Tool” to get started."}
                  </td>
                </tr>
              )}
              {sortedTools.map((tool) => {
                const meta = parseToolMetadata(tool.metadata);
                const views = (meta.uses > 0 && tool.views === 0 ? meta.uses : tool.views).toLocaleString();
                const Icon = getIcon(tool.icon);
                return (
                  <tr key={tool.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400">
                          {Icon ? (
                            <Icon className="h-4 w-4" />
                          ) : (
                            <span className="text-xs font-bold">{(tool.name[0] ?? "?").toUpperCase()}</span>
                          )}
                        </span>
                        <div className="min-w-0">
                          <div className="font-medium text-neutral-900 dark:text-white">{tool.name}</div>
                          <div className="truncate text-xs text-neutral-400">/tools/{tool.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">{tool.category.name}</td>
                    <td className="px-4 py-3">
                      <StatusToggle toolId={tool.id} toolName={tool.name} status={tool.status} />
                    </td>
                    <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">{views}</td>
                    <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">
                      {tool.updatedAt.toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/tools/${tool.id}/edit`}
                          className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-brand-600 transition-colors hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-950/40"
                        >
                          Edit
                        </Link>
                        <a
                          href={`http://localhost:3000/tools/${tool.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                        >
                          View
                        </a>
                        <DeleteToolButton toolId={tool.id} toolName={tool.name} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
