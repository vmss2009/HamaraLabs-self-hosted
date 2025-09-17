import NextAuth from "next-auth";
import AuthentikProvider from "next-auth/providers/authentik";
import { getUserByEmail } from "../db/auth/user";

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
    async signIn({ user }) {
      // Only allow sign-in if the user's email exists in our DB
      const email = user?.email;
      if (!email) return "/sign-in?error=not_allowed";

      const dbUser = await getUserByEmail(email);
      if (!dbUser) {
        // Deny sign-in and redirect back with an error message
        return "/sign-in?error=not_allowed";
      }

      // Attach our internal user id for downstream callbacks
      (user as any).id = dbUser.id;
      return true;
    },
    async jwt({ token, user, profile }) {
      if (user) {
        // Persist our internal user id and provider subject on first sign-in
        (token as any).id = (user as any).id;
        token.sub = (profile?.sub as string) ?? token.sub;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/sign-in",
  },
});