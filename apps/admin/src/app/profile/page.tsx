import { prisma } from "@/lib/prisma";
import { ProfileForm } from "@/components/profile/profile-form";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Profile</h1>
        <p className="mt-1 text-neutral-500 dark:text-neutral-400">Manage your account</p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex flex-col items-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-600 text-2xl font-bold text-white">
              {(admin?.name[0] ?? "A").toUpperCase()}
            </div>
            <h2 className="mt-4 text-lg font-semibold text-neutral-900 dark:text-white">
              {admin?.name ?? "Admin User"}
            </h2>
            <p className="text-sm text-neutral-500">{admin?.email ?? "admin@toolnova.com"}</p>
            <span className="mt-2 rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700 dark:bg-brand-900/30 dark:text-brand-400">
              {admin?.role ?? "Administrator"}
            </span>
          </div>
        </div>

        <div className="lg:col-span-2">
          <ProfileForm userId={admin?.id ?? 0} name={admin?.name ?? "Admin"} email={admin?.email ?? "admin@toolnova.com"} />
        </div>
      </div>
    </div>
  );
}
