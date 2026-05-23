import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db/prisma";
import { getUserByEmail } from "../db/auth/user";
import { authConfig } from "./auth.config";

// Full Node.js-only config — adds Prisma adapter and DB session strategy.
// Do NOT import this in middleware.ts.
export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "database",
    maxAge: 8 * 60 * 60, // 8 hours
  },
  callbacks: {
    async signIn({ user }) {
      const email = user?.email;
      if (!email) return "/sign-in?error=not_allowed";

      const dbUser = await getUserByEmail(email);
      if (!dbUser) return "/sign-in?error=not_allowed";

      user.id = dbUser.id;
      return true;
    },
    async session({ session, user }) {
      session.user.id = user.id;
      return session;
    },
  },
});
