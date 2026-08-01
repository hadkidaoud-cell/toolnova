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
      async authorize(credentials: any) {
        const { email, password } = credentials ?? {};
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

const { handlers } = NextAuth(authConfig);
export const { GET, POST } = handlers;

