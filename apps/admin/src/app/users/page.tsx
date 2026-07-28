export default function UsersPage() {
  const users = [
    { id: 1, name: "John Doe", email: "john@example.com", role: "Admin", status: "Active", joined: "Jan 15, 2024" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", role: "User", status: "Active", joined: "Feb 20, 2024" },
    { id: 3, name: "Bob Wilson", email: "bob@example.com", role: "User", status: "Active", joined: "Mar 10, 2024" },
    { id: 4, name: "Alice Brown", email: "alice@example.com", role: "Moderator", status: "Active", joined: "Apr 5, 2024" },
    { id: 5, name: "Charlie Davis", email: "charlie@example.com", role: "User", status: "Inactive", joined: "May 12, 2024" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Users</h1>
          <p className="mt-1 text-neutral-500 dark:text-neutral-400">Manage user accounts</p>
        </div>
        <button className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
          Add User
        </button>
      </div>

      <div className="mt-6 rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
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
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-brand-600 flex items-center justify-center text-sm font-medium text-white">
                        {user.name[0]}
                      </div>
                      <div>
                        <div className="font-medium text-neutral-900 dark:text-white">{user.name}</div>
                        <div className="text-neutral-500 dark:text-neutral-400">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">{user.role}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      user.status === "Active"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400"
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">{user.joined}</td>
                  <td className="px-4 py-3">
                    <button className="text-brand-600 hover:text-brand-700">Edit</button>
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
