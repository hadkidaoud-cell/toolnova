import { prisma } from "@/lib/prisma";

export default async function SettingsPage() {
  const siteName = await prisma.setting.findUnique({ where: { key: "site_name" } });
  const siteUrl = await prisma.setting.findUnique({ where: { key: "site_url" } });

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Settings</h1>
        <p className="mt-1 text-neutral-500 dark:text-neutral-400">Manage application settings</p>
      </div>

      <div className="mt-6 space-y-6">
        <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="font-semibold text-neutral-900 dark:text-white">General</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Site Name</label>
              <input
                type="text"
                defaultValue={siteName?.value ?? "ToolNova"}
                className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Site URL</label>
              <input
                type="url"
                defaultValue={siteUrl?.value ?? "https://toolnova.com"}
                className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="font-semibold text-neutral-900 dark:text-white">Maintenance</h2>
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-neutral-900 dark:text-white">Maintenance Mode</div>
                <div className="text-sm text-neutral-500">Temporarily disable the site</div>
              </div>
              <button className="rounded-lg border border-neutral-200 px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800">
                Enable
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-neutral-900 dark:text-white">Clear Cache</div>
                <div className="text-sm text-neutral-500">Clear all application cache</div>
              </div>
              <button className="rounded-lg border border-neutral-200 px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800">
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
