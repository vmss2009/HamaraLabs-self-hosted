import NextAuth from "next-auth";
import AuthentikProvider from "next-auth/providers/authentik";
import { ensureUserExists } from "../db/auth/user";

export const { handlers, signIn, signOut, auth } = NextAuth({
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
        return {
          name: profile.name,
          email: profile.email,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, profile }) {
      if (user) {
        token.id = user.id; // Persist "id" in the token
        token.sub = profile?.sub as string;
        // Ensure user exists in our database
        await ensureUserExists(profile?.sub as string, user.email as string, {
          name: user.name,
          email: user.email,
        });
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string; // Pass "id" to session
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/sign-in", // Redirect to custom login page
  },
});