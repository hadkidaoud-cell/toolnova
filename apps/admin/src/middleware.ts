import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import { createAuthConfig } from "@toolnova/auth";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const authConfig: NextAuthConfig = createAuthConfig({
  pages: { signIn: "/login" },
  providers: [],
});

const handler = NextAuth(authConfig).auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = Boolean(req.auth);
  const isLoginPage = nextUrl.pathname === "/login";

  if (!isLoggedIn && !isLoginPage) {
    const loginUrl = new URL("/login", nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname + nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoggedIn && isLoginPage) {
    return NextResponse.redirect(new URL("/", nextUrl.origin));
  }

  return NextResponse.next();
});

export default handler as unknown as (req: NextRequest) => Promise<NextResponse | Response | undefined>;

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
