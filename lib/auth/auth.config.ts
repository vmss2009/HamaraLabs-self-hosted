import type { NextAuthConfig } from "next-auth";
import AuthentikProvider from "next-auth/providers/authentik";

// Edge-compatible config — no Prisma, no Node.js-only imports.
// Used by middleware for lightweight session checks.
export const authConfig: NextAuthConfig = {
  providers: [
    AuthentikProvider({
      id: "authentik",
      name: "Authentik",
      clientId: process.env.AUTHENTIK_CLIENT_ID!,
      clientSecret: process.env.AUTHENTIK_CLIENT_SECRET!,
      issuer: process.env.AUTHENTIK_ISSUER,
      authorization: {
        url: `${process.env.AUTHENTIK_URL}/authorize/`,
        params: { scope: "openid email profile" },
      },
      token: `${process.env.AUTHENTIK_URL}/token/`,
      userinfo: `${process.env.AUTHENTIK_URL}/userinfo/`,
      profile(profile) {
        return { name: profile.name, email: profile.email };
      },
      // Safe because we have one trusted provider and validate users in signIn callback.
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  pages: { signIn: "/sign-in" },
  secret: process.env.NEXTAUTH_SECRET,
};
