import type { NextAuthConfig } from "next-auth";

export function createAuthConfig(options: {
  pages?: NextAuthConfig["pages"];
  callbacks?: NextAuthConfig["callbacks"];
  providers: NextAuthConfig["providers"];
}): NextAuthConfig {
  return {
    pages: options.pages ?? { signIn: "/login" },
    callbacks: {
      async jwt({ token, user }) {
        if (user) {
          (token as any).id = user.id;
          (token as any).role = (user as any).role;
        }
        return token;
      },
      async session({ session, token }) {
        if (session.user) {
          (session.user as any).id = (token as any).id;
          (session.user as any).role = (token as any).role;
        }
        return session;
      },
      ...options.callbacks,
    },
    providers: options.providers,
  };
}
