import NextAuth from "next-auth";
import { createAuthConfig } from "@toolnova/auth";
import { prisma } from "@toolnova/database";
import bcrypt from "bcryptjs";

const authConfig = createAuthConfig({
  providers: [
    {
      id: "credentials",
      name: "Credentials",
      type: "credentials" as const,
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: unknown) {
        const { email, password } = (credentials ?? {}) as Record<string, string | undefined>;
        if (!email || !password) return null;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.password) return null;
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;
        return { id: String(user.id), email: user.email, name: user.name, role: user.role };
      },
    },
  ],
});

export const { auth, signIn, signOut, handlers } = NextAuth(authConfig) as unknown as {
  auth: (req?: Request) => Promise<{ user?: { id?: string; name?: string; email?: string; role?: string }; expires?: string } | null>;
  signIn: (provider?: string, options?: Record<string, unknown>) => Promise<void>;
  signOut: (options?: Record<string, unknown>) => Promise<void>;
  handlers: { GET: (req: Request) => Promise<Response>; POST: (req: Request) => Promise<Response> };
};
