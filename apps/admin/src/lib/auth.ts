import NextAuth from "next-auth";
import { createAuthConfig } from "@toolnova/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

const authConfig = createAuthConfig({
  pages: { signIn: "/login" },
  providers: [
    {
      id: "credentials",
      name: "Credentials",
      type: "credentials" as const,
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: Partial<Record<string, unknown>>) {
        const { email, password } = credentials;
        if (typeof email !== "string" || typeof password !== "string") return null;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.password) return null;
        if (user.status !== "ACTIVE") return null;
        if (user.role !== "ADMIN" && user.role !== "MODERATOR") return null;
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;
        return { id: String(user.id), email: user.email, name: user.name, role: user.role };
      },
    },
  ],
});

export const { auth, signIn, signOut, handlers } = NextAuth(authConfig) as unknown as {
  auth: (req?: Request) => Promise<{ user?: { id?: string; name?: string; email?: string; role?: string }; expires?: string } | null>;
  signIn: (provider?: string, options?: Record<string, unknown>) => Promise<{ error?: string; ok?: boolean } | undefined>;
  signOut: (options?: Record<string, unknown>) => Promise<void>;
  handlers: { GET: (req: Request) => Promise<Response>; POST: (req: Request) => Promise<Response> };
};

export async function requireAdmin(): Promise<void> {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  const role = session.user.role;
  if (role !== "ADMIN" && role !== "MODERATOR") {
    redirect("/login");
  }
}
