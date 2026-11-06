import { auth } from "@/lib/auth/auth";
import { isAdminUser } from "@/lib/db/auth/user";
import { prisma } from "@/lib/db/prisma";

export async function requireAdmin(): Promise<string | null> {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return null;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { user_meta_data: true, roles: true },
  });
  if (!user) return null;
  if (isAdminUser(user) || user.roles.includes("admin")) return userId;
  return null;
}
