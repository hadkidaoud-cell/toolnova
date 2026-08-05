"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { updatePassword, updateProfile } from "@/lib/panel-actions";
import { inputClass, labelClass, btnPrimary } from "@/components/admin/ui";
import { toast } from "@/lib/toast";

interface ProfileFormProps {
  userId: number;
  name: string;
  email: string;
}

export function ProfileForm({ userId, name, email }: ProfileFormProps) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(name);
  const [displayEmail, setEmail] = useState(email);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pending, startTransition] = useTransition();

  function handleProfile(e: FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await updateProfile(userId, displayName, displayEmail);
      if (result.success) {
        toast("Profile updated");
        router.refresh();
      } else {
        toast(result.error ?? "Failed to update profile", "error");
      }
    });
  }

  function handlePassword(e: FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast("New passwords do not match", "error");
      return;
    }
    startTransition(async () => {
      const result = await updatePassword(userId, currentPassword, newPassword);
      if (result.success) {
        toast("Password updated");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        router.refresh();
      } else {
        toast(result.error ?? "Failed to update password", "error");
      }
    });
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleProfile} className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
        <h2 className="font-semibold text-neutral-900 dark:text-white">Personal Information</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="profile_name" className={labelClass}>
              Name
            </label>
            <input
              id="profile_name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="profile_email" className={labelClass}>
              Email
            </label>
            <input
              id="profile_email"
              type="email"
              value={displayEmail}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
        <div className="mt-4">
          <button type="submit" className={btnPrimary} disabled={pending}>
            {pending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>

      <form onSubmit={handlePassword} className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
        <h2 className="font-semibold text-neutral-900 dark:text-white">Change Password</h2>
        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor="current_password" className={labelClass}>
              Current Password
            </label>
            <input
              id="current_password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="new_password" className={labelClass}>
              New Password
            </label>
            <input
              id="new_password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="confirm_password" className={labelClass}>
              Confirm Password
            </label>
            <input
              id="confirm_password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputClass}
            />
          </div>
          <button type="submit" className={btnPrimary} disabled={pending}>
            {pending ? "Updating..." : "Update Password"}
          </button>
        </div>
      </form>
    </div>
  );
}
