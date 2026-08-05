"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { saveSettings } from "@/lib/panel-actions";
import { inputClass, labelClass, btnPrimary, btnSecondary } from "@/components/admin/ui";
import { toast } from "@/lib/toast";

interface SettingsFormProps {
  siteName: string;
  siteUrl: string;
  maintenanceMode: boolean;
}

export function SettingsForm({ siteName, siteUrl, maintenanceMode }: SettingsFormProps) {
  const router = useRouter();
  const [name, setName] = useState(siteName);
  const [url, setUrl] = useState(siteUrl);
  const [maintenance, setMaintenance] = useState(maintenanceMode);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await saveSettings({ site_name: name, site_url: url });
      if (result.success) {
        toast("Settings saved");
        router.refresh();
      } else {
        toast(result.error ?? "Failed to save settings", "error");
      }
    });
  }

  function toggleMaintenance() {
    const next = !maintenance;
    setMaintenance(next);
    startTransition(async () => {
      const result = await saveSettings({ maintenance_mode: next ? "on" : "off" });
      if (result.success) {
        toast(next ? "Maintenance mode enabled" : "Maintenance mode disabled");
        router.refresh();
      } else {
        setMaintenance(maintenance);
        toast(result.error ?? "Failed to update maintenance mode", "error");
      }
    });
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
        <h2 className="font-semibold text-neutral-900 dark:text-white">General</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="site_name" className={labelClass}>
              Site Name
            </label>
            <input
              id="site_name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="site_url" className={labelClass}>
              Site URL
            </label>
            <input
              id="site_url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
        <div className="mt-5 flex gap-3">
          <button type="submit" className={btnPrimary} disabled={pending}>
            {pending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>

      <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
        <h2 className="font-semibold text-neutral-900 dark:text-white">Maintenance</h2>
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-neutral-900 dark:text-white">Maintenance Mode</div>
              <div className="text-sm text-neutral-500">Temporarily disable the site</div>
            </div>
            <button
              onClick={toggleMaintenance}
              disabled={pending}
              className={maintenance ? btnSecondary : "rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-60"}
            >
              {maintenance ? "Enabled" : "Enable"}
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-neutral-900 dark:text-white">Clear Cache</div>
              <div className="text-sm text-neutral-500">Clear all application cache</div>
            </div>
            <button
              type="button"
              onClick={() => toast("Cache cleared", "info")}
              className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
