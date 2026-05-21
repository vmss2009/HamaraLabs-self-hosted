import { auth } from "@/lib/auth/auth";
import { buildAbilityForUser } from "@/lib/authz/ability";
import type { SerializedRule } from "@/lib/authz/types";
import { SessionProvider } from "next-auth/react";
import Drawer from "@/components/ui/Drawer";
import AuthGuard from "@/components/form/AuthGuard";
import { AbilityProvider } from "@/components/authz";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;

  let initialRules: SerializedRule[] = [];
  if (userId) {
    try {
      const result = await buildAbilityForUser(userId);
      initialRules = result.rules;
    } catch (e) {
      console.error("Failed to build server-side ability:", e);
    }
  }

  return (
    <SessionProvider session={session}>
      <AuthGuard>
        <AbilityProvider initialRules={initialRules}>
          <div className="flex">
            <Drawer />
            <main className="flex-1 w-full">{children}</main>
          </div>
        </AbilityProvider>
      </AuthGuard>
    </SessionProvider>
  );
}
