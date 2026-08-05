import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { UsersViewer } from "@/components/users/users-viewer";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });
  const session = await auth();

  const rows = users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt.toLocaleDateString(),
    isSelf: String(user.id) === session?.user?.id,
  }));

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Users</h1>
        <p className="mt-1 text-neutral-500 dark:text-neutral-400">Manage user accounts</p>
      </div>

      <UsersViewer users={rows} />
    </div>
  );
}
