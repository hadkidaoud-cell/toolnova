"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, Trash2 } from "lucide-react";
import { cn } from "@toolnova/utils";
import { deleteUser, setUserStatus, updateUserRole } from "@/lib/panel-actions";
import { toast } from "@/lib/toast";

export interface UserRow {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  isSelf?: boolean;
}

const ROLES = ["ADMIN", "USER", "MODERATOR"];
const STATUSES = ["ACTIVE", "INACTIVE", "BANNED"];

function statusStyle(status: string): string {
  if (status === "ACTIVE") return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
  if (status === "INACTIVE") return "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400";
  return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
}

export function UsersViewer({ users }: { users: UserRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<string>("ALL");
  const [status, setStatus] = useState<string>("ALL");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((user) => {
      if (role !== "ALL" && user.role !== role) return false;
      if (status !== "ALL" && user.status !== status) return false;
      if (!q) return true;
      return `${user.name} ${user.email}`.toLowerCase().includes(q);
    });
  }, [users, query, role, status]);

  const counts = useMemo(() => {
    const byRole: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    for (const user of users) {
      byRole[user.role] = (byRole[user.role] ?? 0) + 1;
      byStatus[user.status] = (byStatus[user.status] ?? 0) + 1;
    }
    return { byRole, byStatus };
  }, [users]);

  function handleRoleChange(user: UserRow, next: string) {
    startTransition(async () => {
      const result = await updateUserRole(user.id, next as "ADMIN" | "USER" | "MODERATOR");
      if (result.success) {
        toast(`Role updated for ${user.name}`);
        router.refresh();
      } else {
        toast(result.error ?? "Failed to update role", "error");
      }
    });
  }

  function handleStatus(user: UserRow, next: string) {
    startTransition(async () => {
      const result = await setUserStatus(user.id, next as "ACTIVE" | "INACTIVE" | "BANNED");
      if (result.success) {
        toast(`Status updated for ${user.name}`);
        router.refresh();
      } else {
        toast(result.error ?? "Failed to update status", "error");
      }
    });
  }

  function handleDelete(user: UserRow) {
    if (!window.confirm(`Delete user "${user.name}" (${user.email})? This cannot be undone.`)) return;
    startTransition(async () => {
      const result = await deleteUser(user.id);
      if (result.success) {
        toast(`Deleted user "${user.name}"`);
        router.refresh();
      } else {
        toast(result.error ?? "Failed to delete user", "error");
      }
    });
  }

  return (
    <div>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {ROLES.map((r) => (
          <div key={r} className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
            <div className="text-sm text-neutral-500 dark:text-neutral-400">{r}</div>
            <div className="mt-1 text-2xl font-bold text-neutral-900 dark:text-white">
              {counts.byRole[r] ?? 0}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex flex-col gap-3 border-b border-neutral-200 p-4 sm:flex-row dark:border-neutral-800">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full rounded-lg border border-neutral-300 bg-white py-1.5 pl-9 pr-3 text-sm focus:border-brand-500 focus:outline-none dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
            />
          </div>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-sm focus:border-brand-500 focus:outline-none dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
          >
            <option value="ALL">All Roles</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-sm focus:border-brand-500 focus:outline-none dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
          >
            <option value="ALL">All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0) + s.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-800/50">
              <tr>
                <th className="px-4 py-3 font-medium text-neutral-600 dark:text-neutral-400">User</th>
                <th className="px-4 py-3 font-medium text-neutral-600 dark:text-neutral-400">Role</th>
                <th className="px-4 py-3 font-medium text-neutral-600 dark:text-neutral-400">Status</th>
                <th className="px-4 py-3 font-medium text-neutral-600 dark:text-neutral-400">Joined</th>
                <th className="px-4 py-3 font-medium text-neutral-600 dark:text-neutral-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-neutral-400">
                    No users match your filters
                  </td>
                </tr>
              )}
              {filtered.map((user) => (
                <tr key={user.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-sm font-medium text-white">
                        {(user.name[0] ?? "?").toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-neutral-900 dark:text-white">
                          {user.name}
                          {user.isSelf && (
                            <span className="ml-2 rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                              you
                            </span>
                          )}
                        </div>
                        <div className="text-neutral-500 dark:text-neutral-400">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={user.role}
                      disabled={pending || user.isSelf}
                      onChange={(e) => handleRoleChange(user, e.target.value)}
                      className="rounded-lg border border-neutral-300 bg-white px-2 py-1 text-xs focus:border-brand-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-medium", statusStyle(user.status))}>
                        {user.status.charAt(0) + user.status.slice(1).toLowerCase()}
                      </span>
                      {!user.isSelf && (
                        <select
                          value={user.status}
                          disabled={pending}
                          onChange={(e) => handleStatus(user, e.target.value)}
                          className="rounded-lg border border-neutral-300 bg-white px-1 py-1 text-xs focus:border-brand-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s.charAt(0) + s.slice(1).toLowerCase()}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">{user.createdAt}</td>
                  <td className="px-4 py-3">
                    {!user.isSelf && (
                      <button
                        onClick={() => handleDelete(user)}
                        disabled={pending}
                        className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50 dark:text-red-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
