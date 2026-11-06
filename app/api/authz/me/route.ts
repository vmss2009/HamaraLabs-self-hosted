import { auth } from "@/lib/auth/auth";
import { failure, success } from "@/lib/api/http";
import { buildAbilityForUser } from "@/lib/authz/ability";

export async function GET() {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return failure("Not authenticated", 401, { code: "UNAUTHENTICATED" });
  }
  const { rules } = await buildAbilityForUser(userId);
  return success({ rules });
}
