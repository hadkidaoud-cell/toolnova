import { prisma } from "@/lib/prisma";
import { SettingsForm } from "@/components/settings/settings-form";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const siteName = await prisma.setting.findUnique({ where: { key: "site_name" } });
  const siteUrl = await prisma.setting.findUnique({ where: { key: "site_url" } });
  const maintenanceMode = await prisma.setting.findUnique({ where: { key: "maintenance_mode" } });

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Settings</h1>
        <p className="mt-1 text-neutral-500 dark:text-neutral-400">Manage application settings</p>
      </div>

      <div className="mt-6">
        <SettingsForm
          siteName={siteName?.value ?? "ToolNova"}
          siteUrl={siteUrl?.value ?? "https://toolnova.com"}
          maintenanceMode={maintenanceMode?.value === "on"}
        />
      </div>
    </div>
  );
}
